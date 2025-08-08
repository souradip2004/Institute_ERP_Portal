import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {PaymentStatus, Prisma, PaymentTerms} from "@prisma/client";


interface GlobalFeePayload {
  name: string;
  description?: string;
  amount: number;
  taxPercentage: number;
  paymentterms: PaymentTerms; // Use the Prisma enum for type safety
  penalty: number;
  dueDate?: string; // Optional: only for ONE_TIME
  motherClassIds: string[];
}

function calculateDueDates(
  startDate: Date,
  endDate: Date,
  term: PaymentTerms,
  oneTimeDueDate?: string
): Date[] {
  const dates: Date[] = [];

  if (term === 'ONE_TIME') {
    if (!oneTimeDueDate) {
      throw new Error("A specific 'dueDate' is required for ONE_TIME payment terms.");
    }
    const singleDate = new Date(oneTimeDueDate);
    // The existing logic for ONE_TIME is correct: cap at endDate if it exceeds it.
    dates.push(singleDate > endDate ? endDate : singleDate);
    return dates;
  }

  let currentDueDate = new Date(startDate.toISOString());
  const incrementMap: Record<Exclude<PaymentTerms, 'ONE_TIME'>, number> = {
    MONTHLY: 1,
    QUARTERLY: 3,
    HALF_YEARLY: 6,
    YEARLY: 12,
  };
  const monthIncrement = incrementMap[term];

  do {
    // Only add the date if it's on or before the semester ends.
    if (currentDueDate <= endDate) {
      dates.push(new Date(currentDueDate.toISOString()));
    }
    // Increment for the next potential cycle.
    currentDueDate.setMonth(currentDueDate.getMonth() + monthIncrement);
  } while (currentDueDate <= endDate);


  const lastPushedDate = dates.length > 0 ? dates[dates.length - 1] : null;
  if (lastPushedDate && lastPushedDate.getTime() < endDate.getTime()) {
    dates.push(endDate);
  }

  if(dates.length === 0 && startDate.getTime() === endDate.getTime()){
    dates.push(endDate);
  }

  return dates;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      globalFees,
      institutionId
    }: {
      globalFees: GlobalFeePayload[];
      institutionId: string;
    } = body;

    // --- 1. Validation (Unchanged and Correct) ---
    for (const fee of globalFees) {
      // (Validation logic is correct and remains here)
      if (fee.paymentterms === 'ONE_TIME' && !fee.dueDate) {
        return NextResponse.json({error: `The 'dueDate' field is required for fee "${fee.name}" because its payment term is ONE_TIME.`}, {status: 400});
      }
    }

    const allMotherClassIds = new Set(globalFees.flatMap(fee => fee.motherClassIds));

    const result = await prisma.$transaction(async (tx) => {

      const studentEnrollments = await tx.studentClassEnrollment.findMany({
        where: {
          classSection: {motherClassId: {in: Array.from(allMotherClassIds)}},
          enrollmentStatus: 'ENROLLED'
        },
        select: {studentId: true, classSection: {select: {motherClassId: true}}}
      });

      const studentsByMotherClass = new Map<string, Set<string>>();
      for (const enrollment of studentEnrollments) {
        if (enrollment.classSection.motherClassId) {
          const students = studentsByMotherClass.get(enrollment.classSection.motherClassId) || new Set();
          students.add(enrollment.studentId);
          studentsByMotherClass.set(enrollment.classSection.motherClassId, students);
        }
      }

      const createdGlobalFeesData = [];
      const allFeesCollectionToCreate: Prisma.FeesCollectionCreateManyInput[] = [];

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

        for (const motherClassId of fee.motherClassIds) {

          const sectionWithSemester = await tx.classSection.findFirst({
            where: {motherClassId: motherClassId},
            select: {
              semester: {select: {startDate: true, endDate: true}}
            }
          });

          if (!sectionWithSemester || !sectionWithSemester.semester) {
            // Throw an error if a class has no sections or semester link, which is a data integrity issue.
            throw new Error(`Could not determine the semester for MotherClass ID: ${motherClassId}`);
          }
          const semester = sectionWithSemester.semester;
          // --- MODIFICATION END ---

          const dueDates = calculateDueDates(semester.startDate, semester.endDate, fee.paymentterms, fee.dueDate);
          if (dueDates.length === 0) continue;

          for (const dueDate of dueDates) {
            const newClassFee = await tx.classFee.create({
              data: {
                globalFeesId: createdGlobalFee.id,
                motherClassId: motherClassId,
                dueDate: dueDate
              }
            });

            const studentIds = studentsByMotherClass.get(motherClassId);
            if (studentIds && studentIds.size > 0) {
              for (const studentId of studentIds) {
                allFeesCollectionToCreate.push({
                  classFeeId: newClassFee.id,
                  studentId: studentId,
                  status: PaymentStatus.PENDING
                });
              }
            }
          }
        }
        createdGlobalFeesData.push(createdGlobalFee);
      }

      if (allFeesCollectionToCreate.length > 0) {
        await tx.feesCollection.createMany({
          data: allFeesCollectionToCreate,
          skipDuplicates: true
        });
      }

      return createdGlobalFeesData;
    });

    return NextResponse.json(
      {
        message: 'Global fees and their recurring payment schedules created successfully.',
        data: result
      },
      {status: 201}
    );

  } catch (error: any) {
    // Error handling updated to catch the new specific error message
    console.error('Error creating global fees:', error);
    return NextResponse.json(
      {error: error.message || 'An internal server error occurred.'},
      {status: error.message.includes("Could not determine the semester") ? 404 : (error.message.includes("required for") ? 400 : 500)}
    );
  }
}

interface GlobalFeeUpdatePayload {
  id: string;
  institutionId: string;
  name?: string;
  description?: string;
  amount?: number;
  taxPercentage?: number;
  paymentterms?: PaymentTerms;
  penalty?: number;
  dueDate?: string;
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const globalFeesToUpdate: GlobalFeeUpdatePayload[] = body.fees;

    // --- 1. Input Validation ---
    if (!Array.isArray(globalFeesToUpdate) || globalFeesToUpdate.length === 0) {
      return NextResponse.json({error: 'The request body must contain a non-empty `fees` array.'}, {status: 400});
    }

    for (const fee of globalFeesToUpdate) {
      if (!fee.id || !fee.institutionId) {
        throw new Error('Every fee object must have an `id` and `institutionId`.');
      }
      if (fee.paymentterms === 'ONE_TIME' && !fee.dueDate) {
        throw new Error(`The 'dueDate' is required for fee "${fee.name || fee.id}" because its new payment term is ONE_TIME.`);
      }
    }

    const updatedFees = await prisma.$transaction(async (tx) => {

      const allFeeIds = globalFeesToUpdate.map(f => f.id);
      const allRelatedClassFees = await tx.classFee.findMany({
        where: { globalFeesId: { in: allFeeIds } },
        select: { motherClassId: true }
      });

      const allMotherClassIds = [...new Set(allRelatedClassFees.map(cf => cf.motherClassId))];

      const studentEnrollments = await tx.studentClassEnrollment.findMany({
        where: {
          classSection: { motherClassId: { in: allMotherClassIds } },
          enrollmentStatus: 'ENROLLED'
        },
        select: { studentId: true, classSection: { select: { motherClassId: true } } }
      });

      const studentsByMotherClass = new Map<string, Set<string>>();
      for (const enrollment of studentEnrollments) {
        if (enrollment.classSection.motherClassId) {
          const students = studentsByMotherClass.get(enrollment.classSection.motherClassId) || new Set();
          students.add(enrollment.studentId);
          studentsByMotherClass.set(enrollment.classSection.motherClassId, students);
        }
      }

      const updatePromises = globalFeesToUpdate.map(async (fee) => {
        const { id, institutionId, dueDate, ...dataToUpdate } = fee;

        const updatedGlobalFee = await tx.globalFees.update({
          where: { id: id, institutionId: institutionId },
          data: dataToUpdate,
        });

        if (dataToUpdate.paymentterms) {
          // Find all old ClassFees to get their IDs and associated MotherClasses
          const oldClassFees = await tx.classFee.findMany({
            where: { globalFeesId: id },
            select: { id: true, motherClassId: true }
          });

          if (oldClassFees.length > 0) {
            const oldClassFeeIds = oldClassFees.map(cf => cf.id);
            const motherClassIdsToRecreate = [...new Set(oldClassFees.map(cf => cf.motherClassId))];

            // Delete all associated children (FeesCollection) first
            await tx.feesCollection.deleteMany({
              where: { classFeeId: { in: oldClassFeeIds } }
            });

            // Delete the old schedule (ClassFee)
            await tx.classFee.deleteMany({
              where: { id: { in: oldClassFeeIds } }
            });

            // Re-create the new schedule
            const feesCollectionToCreate: Prisma.FeesCollectionCreateManyInput[] = [];
            for (const mcId of motherClassIdsToRecreate) {
              const section = await tx.classSection.findFirst({
                where: { motherClassId: mcId },
                select: { semester: { select: { startDate: true, endDate: true } } }
              });

              if (!section?.semester) continue;

              const newDueDates = calculateDueDates(section.semester.startDate, section.semester.endDate, dataToUpdate.paymentterms, dueDate);
              for (const newDueDate of newDueDates) {
                const newClassFee = await tx.classFee.create({
                  data: {
                    globalFeesId: id,
                    motherClassId: mcId,
                    dueDate: newDueDate,
                  }
                });

                const studentIds = studentsByMotherClass.get(mcId);
                if (studentIds) {
                  for (const studentId of studentIds) {
                    feesCollectionToCreate.push({
                      classFeeId: newClassFee.id,
                      studentId: studentId,
                      status: PaymentStatus.PENDING,
                    });
                  }
                }
              }
            }
            if (feesCollectionToCreate.length > 0) {
              await tx.feesCollection.createMany({ data: feesCollectionToCreate, skipDuplicates: true });
            }
          }
        }

        return updatedGlobalFee;
      });

      return Promise.all(updatePromises);
    });

    return NextResponse.json(
      { message: 'Global fees updated successfully.', data: updatedFees },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error updating global fees:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'One or more fees to update were not found. Please check IDs and institution link.' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
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

    const globalFees = await prisma.globalFees.findMany({
      where: {
        classFees: {
          some: {
            motherClass: {
              institutionId: institutionId
            }
          }
        },
      },
      include: {
        classFees: {
          select: {
            dueDate: true,
            id: true,
            motherClassId: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("globalFees: ", globalFees);

    const motherClasses = await prisma.motherClass.findMany({
      where: {
        institutionId: institutionId,
      },
      include: {
        classfee: {
          where: {
            globalFees: {
              isNot: null,
            }
          },
          select: {
            dueDate: true,
            id: true,
          }
        }
      }
    })
    console.log("motherClass: ", globalFees);

    return NextResponse.json({
      globalFees, motherClasses
    }, {status: 200});

  } catch (e) {
    console.log(e);

    return NextResponse.json({error: "Internal server error. Please try again later."}, {status: 500});
  }
}