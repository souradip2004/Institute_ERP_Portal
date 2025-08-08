import {NextResponse} from 'next/server';
import {Prisma, PaymentStatus, PaymentTerms} from '@prisma/client';
import prisma from '@/lib/prisma';
import {calculateDueDates} from "@/app/api/payment/global-fees/route";

interface LocalFeePayload {
  name: string;
  description?: string;
  amount: number;
  taxPercentage: number;
  paymentterms: PaymentTerms;
  penalty?: number;
  dueDate?: string;
  motherClassId: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      localFees,
      institutionId
    }: {
      localFees: LocalFeePayload[];
      institutionId: string;
    } = body;

    // --- 1. Input Validation ---
    if (!institutionId || !Array.isArray(localFees) || localFees.length === 0) {
      return NextResponse.json({error: 'institutionId and a non-empty localFees array are required.'}, {status: 400});
    }

    // Comprehensive validation for each fee object
    for (const fee of localFees) {
      const { name, amount, taxPercentage, paymentterms, motherClassId } = fee;
      if (!name || amount == null || taxPercentage == null || !paymentterms || !motherClassId) {
        return NextResponse.json({error: `Missing required fields for fee: "${name}"`}, {status: 400});
      }
      if (fee.paymentterms === 'ONE_TIME' && !fee.dueDate) {
        return NextResponse.json({error: `The 'dueDate' field is required for fee "${name}" because its payment term is ONE_TIME.`}, {status: 400});
      }

      if (fee.dueDate) {
        return NextResponse.json({error: "Due Date should only be passed if paymentterms is ONE_TIME!"}, {status: 400})
      }
    }

    // --- 2. Pre-transaction Validation (Fail-Fast) ---
    const allMotherClassIds = [...new Set(localFees.map(f => f.motherClassId))];
    const existingMotherClassesCount = await prisma.motherClass.count({ where: { id: { in: allMotherClassIds } } });

    if (existingMotherClassesCount !== allMotherClassIds.length) {
      return NextResponse.json({error: "One or more motherClassIds provided do not exist."}, {status: 404});
    }

    // --- 3. Transaction for Atomic Creation ---
    const result = await prisma.$transaction(async (tx) => {
      const createdFeesResult = [];

      for (const fee of localFees) {
        // --- a. Create the LocalFees master record ---
        const createdFee = await tx.localFees.create({
          data: {
            name: fee.name,
            description: fee.description,
            amount: fee.amount,
            taxPercentage: fee.taxPercentage,
            paymentterms: fee.paymentterms,
            penalty: fee.penalty,
          },
        });

        // --- b. Get semester details for due date calculation ---
        const section = await tx.classSection.findFirst({
          where: { motherClassId: fee.motherClassId },
          select: { semester: { select: { startDate: true, endDate: true } } }
        });
        if (!section?.semester) {
          throw new Error(`Could not determine the semester for MotherClass ID: ${fee.motherClassId}`);
        }

        // --- c. Generate the payment schedule (due dates) ---
        const dueDates = calculateDueDates(section.semester.startDate, section.semester.endDate, fee.paymentterms, fee.dueDate);

        // --- d. Create a ClassFee for each payment cycle ---
        // This loop now only creates the ClassFee schedule.
        for (const dueDate of dueDates) {
          await tx.classFee.create({
            data: {
              localFeesId: createdFee.id,
              motherClassId: fee.motherClassId,
              dueDate: dueDate,
            },
          });
        }

        createdFeesResult.push(createdFee);
      }

      return createdFeesResult;
    });

    return NextResponse.json(
      {
        message: 'Local fees and their recurring class schedules created successfully.',
        data: result,
      },
      {status: 201}
    );

  } catch (error: any) {
    console.error("Error creating local fees: ", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') { // Foreign key constraint failed
        return NextResponse.json({ error: "A provided motherClassId does not exist." }, { status: 404 });
      }
    }
    return NextResponse.json(
      {error: error.message || 'An internal server error occurred.'},
      {status: error.message.includes("Could not determine") ? 404 : (error.message.includes("required for") ? 400 : 500)}
    );
  }
}

interface UpdateLocalFeePayload {
  id: string;
  name?: string;
  description?: string;
  amount?: number;
  taxPercentage?: number;
  penalty?: number;
  paymentterms?: PaymentTerms;
  dueDate?: string;
}
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const localFeesToUpdate: UpdateLocalFeePayload[] = body.localFees;

    // --- 1. Input Validation ---
    if (!Array.isArray(localFeesToUpdate) || localFeesToUpdate.length === 0) {
      return NextResponse.json({error: 'An array of `localFees` to update is required.'}, {status: 400});
    }

    for (const fee of localFeesToUpdate) {
      if (!fee.id) {
        throw new Error('Every fee object in the array must have an `id`.');
      }
      if (fee.paymentterms === 'ONE_TIME' && !fee.dueDate) {
        throw new Error(`The 'dueDate' is required for fee ID "${fee.id}" because its new payment term is ONE_TIME.`);
      }
    }

    // --- 2. Transaction for Atomic "Delete and Recreate" Logic ---
    const updatedFees = await prisma.$transaction(async (tx) => {
      // Use Promise.all to run all update operations concurrently
      const updatePromises = localFeesToUpdate.map(async (fee) => {
        const { id, dueDate, ...dataToUpdate } = fee;

        // --- a. Update the main LocalFee record with simple data ---
        const updatedLocalFee = await tx.localFees.update({
          where: { id: id },
          data: dataToUpdate
        });

        if (dataToUpdate.paymentterms) {
          // Find the single MotherClass this fee is linked to
          const firstClassFee = await tx.classFee.findFirst({
            where: { localFeesId: id },
            select: { motherClassId: true },
          });

          // If there's no schedule, there's nothing to regenerate.
          if (!firstClassFee) {
            console.warn(`LocalFee ${id} has no class schedule to regenerate. Skipping schedule update.`);
            return updatedLocalFee;
          }
          const motherClassId = firstClassFee.motherClassId;

          // --- c. Delete ONLY the old ClassFee schedule ---
          await tx.classFee.deleteMany({ where: { localFeesId: id } });

          // --- d. Re-create the new ClassFee schedule ---
          const section = await tx.classSection.findFirst({
            where: { motherClassId: motherClassId },
            select: { semester: { select: { startDate: true, endDate: true } } }
          });
          if (!section?.semester) {
            throw new Error(`Could not determine semester for the class linked to LocalFee ID ${id}.`);
          }

          const newDueDates = calculateDueDates(section.semester.startDate, section.semester.endDate, dataToUpdate.paymentterms, dueDate);

          // Create the new ClassFee records.
          for (const newDueDate of newDueDates) {
            await tx.classFee.create({
              data: {
                localFeesId: id,
                motherClassId: motherClassId,
                dueDate: newDueDate,
              }
            });
          }
        }

        return updatedLocalFee;
      });

      return Promise.all(updatePromises);
    });

    return NextResponse.json(
      { message: 'Local fees and their class schedules updated successfully.', data: updatedFees },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error updating local fees:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'One or more fees to update were not found. Please check the IDs.' }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: error.message.includes("Could not determine") ? 404 : (error.message.includes("required for") ? 400 : 500) }
    );
  }
}

export async function DELETE(request: Request) {
  try {

    const {searchParams} = new URL(request.url);
    const localFeesId = searchParams.get('localFeesId') as string;

    if (!localFeesId) {
      return NextResponse.json({error: "localFeesId required !"}, {status: 400});
    }

    const deleted = await prisma.localFees.delete({
      where: {
        id: localFeesId
      }
    });

    console.log("deleted: ", deleted);

    return NextResponse.json(deleted, {status: 200});

  } catch (e: any) {
    console.log("Error ", e);

    return NextResponse.json({error: "Internal server error", message: e.message})
  }
}

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const motherClassId = searchParams.get('motherClassId');

    if (!motherClassId) {
      return NextResponse.json(
        {error: 'motherClassId is required!'},
        {status: 400}
      );
    }

    const classLocalFees = await prisma.localFees.findMany({
      where: {
        classFees: {
          some: {
            motherClassId: motherClassId
          }
        }
      },
      include: {
        classFees: {
          select: {
            dueDate: true,
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const motherClassWithStudents = await prisma.motherClass.findUnique({
      where: {id: motherClassId},
      select: {
        institutionId: true,
        sectionName: true,
        classSections: {
          select: {
            studentEnrollments: {
              select: {
                student: {
                  include: {
                    user: {select: {name: true, email: true}},
                    localFees: {
                      select: {
                        localFeesId: true,
                        id: true,
                        offsetFee: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log("Motherclass with students: ", motherClassWithStudents);

    if (!motherClassWithStudents) {
      return NextResponse.json({error: 'Class not found!'}, {status: 404});
    }

    // --- 3. Process the data to build the final, structured response ---
    const studentEnrollments =
      motherClassWithStudents.classSections[0]?.studentEnrollments || [];

    const processedStudents = studentEnrollments.map((enrollment) => {
      const student = enrollment.student;

      // Create a lookup map for the student's existing fees for O(1) access time
      const studentFeeLinkMap = new Map(
        student.localFees.map((feeLink) => [
          feeLink.localFeesId,
          {id: feeLink.id, offsetFee: feeLink.offsetFee},
        ])
      );

      // For each student, generate their specific fee statuses by referencing the main class fees list
      const feeStatuses = classLocalFees.map((classFee) => {
        const studentLink = studentFeeLinkMap.get(classFee.id);
        return {
          localFeeId: classFee.id, // ID of the fee in the top-level array
          localFeesOnStudentId: studentLink?.id || null, // The join table record ID, or null
          offsetFee: studentLink?.offsetFee ?? null, // The specific offset, or null
        };
      }).filter((feeStatus) => feeStatus.localFeesOnStudentId !== null && feeStatus.offsetFee !== null);

      return {
        id: student.id,
        studentRoll: student.studentRoll,
        enrollmentStatus: student.enrollmentStatus,
        user: student.user,
        feeLinks: feeStatuses
      };
    });

    // --- 4. Assemble the final response object ---
    return NextResponse.json(
      {
        institute: motherClassWithStudents.institutionId,
        section: motherClassWithStudents.sectionName,
        localFees: classLocalFees, // The single, top-level array of fee details
        studentEnrollments: processedStudents, // The array of students with their specific fee links
      },
      {status: 200}
    );

  } catch
    (e) {
    console.error(e); // Log the actual error on the server
    return NextResponse.json(
      {error: 'Internal server error. Please try again later.'},
      {status: 500}
    );
  }
}
