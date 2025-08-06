import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {PaymentStatus, Prisma} from "@prisma/client";

interface GlobalFee {
  name: string;
  description?: string;
  amount: number;
  taxPercentage: number;
  paymentterms: string;
  penalty: number;
  dueDate: string;
  motherClassIds: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      globalFees,
      institutionId
    }: {
      globalFees: GlobalFee[];
      institutionId: string;
    } = body;

    // --- Validation (Unchanged and Correct) ---
    for (const globalFee of globalFees) {
      const {
        name,
        amount,
        taxPercentage,
        paymentterms,
        motherClassIds,
        dueDate
      } = globalFee;

      if (!name || amount == null || taxPercentage == null || !paymentterms || !institutionId || !Array.isArray(motherClassIds) || motherClassIds.length === 0 || motherClassIds.some(id => !id) || !dueDate) {
        return NextResponse.json({error: 'Missing required fields in one or more fee objects.'}, {status: 400});
      }
    }

    const allMotherClassIds = new Set<string>();
    globalFees.forEach(fee => fee.motherClassIds.forEach(id => allMotherClassIds.add(id)));

    const existingMotherClasses = await prisma.motherClass.count({
      where: {id: {in: Array.from(allMotherClassIds)}},
    });

    if (existingMotherClasses !== allMotherClassIds.size) {
      return NextResponse.json({error: "One or more motherClassIds provided do not exist."}, {status: 404});
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find all relevant students beforehand (Efficient and Unchanged)
      const studentEnrollments = await tx.studentClassEnrollment.findMany({
        where: {
          classSection: {
            motherClassId: {in: Array.from(allMotherClassIds)}
          },
          enrollmentStatus: 'ENROLLED' // Assuming 'ENROLLED' is a valid status
        },
        select: {
          studentId: true,
          classSection: {select: {motherClassId: true}}
        }
      });

      // Create a map for easy lookup: motherClassId -> [studentId, studentId, ...]
      const studentsByMotherClass = new Map<string, string[]>();
      for (const enrollment of studentEnrollments) {
        if (enrollment.classSection.motherClassId) {
          const students = studentsByMotherClass.get(enrollment.classSection.motherClassId) || [];
          students.push(enrollment.studentId);
          studentsByMotherClass.set(enrollment.classSection.motherClassId, students);
        }
      }

      const createdGlobalFeesData = [];

      for (const fee of globalFees) {
        const createdGlobalFee = await tx.globalFees.create({
          data: {
            name: fee.name,
            description: fee.description,
            amount: fee.amount,
            taxPercentage: fee.taxPercentage,
            paymentterms: fee.paymentterms,
            penalty: fee.penalty,
            institutionId
          }
        });

        const feesCollectionToCreate: Prisma.FeesCollectionCreateManyInput[] = [];

        for (const motherClassId of fee.motherClassIds) {
          // MODIFICATION 1: Add the dueDate when creating the ClassFee
          const newClassFee = await tx.classFee.create({
            data: {
              globalFeesId: createdGlobalFee.id,
              motherClassId: motherClassId,
              dueDate: new Date(fee.dueDate) // Correctly set the due date
            }
          });

          // MODIFICATION 2: Generate FeesCollection for each student in the class
          const studentIds = studentsByMotherClass.get(motherClassId);
          if (studentIds && studentIds.length > 0) {
            for (const studentId of studentIds) {

              feesCollectionToCreate.push({
                classFeeId: newClassFee.id,
                studentId: studentId,
                status: PaymentStatus.PENDING
              });
            }
          }
        }

        // Step 4: Perform a single bulk-insert for all prepared FeesCollection records for this fee
        if (feesCollectionToCreate.length > 0) {
          await tx.feesCollection.createMany({
            data: feesCollectionToCreate,
            skipDuplicates: true
          });
        }
        createdGlobalFeesData.push(createdGlobalFee);
      }

      return createdGlobalFeesData;
    });

    return NextResponse.json(
      {
        message: 'Global fees created and assigned to all relevant students successfully.',
        data: result
      },
      {status: 201}
    );

  } catch (error) {
    // --- Error Handling (Unchanged and Correct) ---
    console.error('Error creating global fees:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return NextResponse.json({error: 'One or more of the fee records you are trying to create already exist.'}, {status: 409});
        case 'P2003':
          const fieldName = (error.meta as { field_name?: string })?.field_name;
          return NextResponse.json(
            {error: `Failed to create records. An invalid ID was provided for the '${fieldName}' field.`},
            {status: 400}
          );
        default:
          console.warn(`Unhandled Prisma Error Code: ${error.code}`);
          break;
      }
    }
    return NextResponse.json({error: 'An internal server error occurred.'}, {status: 500});
  }
}

interface GlobalFeeUpdatePayload {
  id: string;
  institutionId: string;
  name?: string;
  description?: string;
  amount?: number;
  taxPercentage?: number;
  paymentterms?: string;
  penalty?: number;
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      dueDate,
      globalFeesToUpdate
    }: {
      dueDate?: string,
      globalFeesToUpdate: GlobalFeeUpdatePayload[];
    } = body;

    // --- 1. Input Validation ---
    if (!Array.isArray(globalFeesToUpdate) || globalFeesToUpdate.length === 0) {
      return NextResponse.json({error: 'The request body must contain a non-empty `globalFeesToUpdate` array.'}, {status: 400});
    }
    if (globalFeesToUpdate.some(fee => !fee.id || !fee.institutionId)) {
      return NextResponse.json({error: 'Every fee object in the array must have an `id` and `institutionId`.'}, {status: 400});
    }

    // --- 2. Pre-transaction Validation (Fail Fast) ---
    const instituteExists = await prisma.institution.findUnique({
      where: {id: globalFeesToUpdate[0].institutionId},
    });
    if (!instituteExists) {
      return NextResponse.json({error: "The specified institution does not exist."}, {status: 404});
    }

    // --- 3. Transaction for Atomic Updates ---
    const updatedFees = await prisma.$transaction(async (tx) => {
      // Use Promise.all to run all update operations concurrently for better performance
      const updatePromises = globalFeesToUpdate.map((fee) => {
        const {id, institutionId, ...dataToUpdate} = fee;

        return tx.globalFees.update({
          where: {
            id: id,
            institutionId: institutionId, // Security check: ensure fee belongs to the institution
          },
          data: {
            ...dataToUpdate,
            ...(dueDate && {
              classFees: {
                updateMany: {
                  // The `where` is empty, so it applies to ALL related ClassFee records for this GlobalFee.
                  where: {},
                  data: {
                    // Set the new due date on all related ClassFee records.
                    dueDate: new Date(dueDate),
                  },
                },
              },
            }),
          },
        });
      });

      // Execute all the prepared update promises
      const results = await Promise.all(updatePromises);
      return results;
    });

    return NextResponse.json(
      {
        message: 'Global fees updated successfully.',
        data: updatedFees,
      },
      {status: 200}
    );

  } catch (error) {
    // --- 4. Robust Error Handling ---
    console.error('Error updating global fees:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // "Record to update not found"
        return NextResponse.json(
          {error: 'One or more fees to update were not found. Please check the IDs and ensure they belong to the correct institution.'},
          {status: 404}
        );
      }
      if (error.code === 'P2002') { // Unique constraint violation
        return NextResponse.json(
          {error: 'Update failed because it would create a duplicate record (e.g., a fee with that name already exists).'},
          {status: 409}
        );
      }
    }

    return NextResponse.json(
      {error: 'An internal server error occurred.'},
      {status: 500}
    );
  }
}

export async function DELETE(request: Request) {
  try {

    const {searchParams} = new URL(request.url);
    const globalFeesId = searchParams.get('globalFeesId') as string;

    if (!globalFeesId) {
      return NextResponse.json({error: "GlobalFeesId required"}, {status: 404});
    }

    const deleted = await prisma.globalFees.delete({
      where: {
        id: globalFeesId
      }
    });
    console.log("deleted: ", deleted);

    return NextResponse.json(deleted, {status: 200});


  } catch (e) {
    console.log("Error in GET: ", e);

    return NextResponse.json({error: "Internal server error. Please try again later."}, {status: 500});
  }
}

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    // const motherClassId = searchParams.get('motherClassId') as string;
    const institutionId = searchParams.get('institutionId') as string;

    if (!institutionId) {
      return NextResponse.json({error: "All fields are required !"});
    }

    const motherClass = await prisma.motherClass.findMany({
      where: {
        institutionId
      },
      include: {
        classfee: {
          select: {
            globalFees: {
              select: {
                id: true,
                name: true,
                amount: true,
                taxPercentage: true,
                paymentterms: true,
                penalty: true,
                description: true,
                institutionId: true
              }
            }
          }
        },
      }
    });

    console.log("motherClass: ", motherClass);

    return NextResponse.json({motherClass}, {status: 200});

  } catch (e) {
    console.log(e);

    return NextResponse.json({error: "Internal server error. Please try again later."}, {status: 500});
  }
}