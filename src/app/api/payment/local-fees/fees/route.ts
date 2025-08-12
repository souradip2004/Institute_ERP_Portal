import {NextResponse} from 'next/server';
import {PaymentStatus, Prisma, PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {studentIds, localFeesId, offsetFee} = body;

    if (
      !Array.isArray(studentIds) ||
      studentIds.length === 0 ||
      !localFeesId ||
      typeof offsetFee !== 'number'
    ) {
      return NextResponse.json(
        {
          error:
            'A non-empty studentIds array, a localFeesId, and a numeric offsetFee are required.',
        },
        {status: 400}
      );
    }

    // --- 2. Transaction for Atomic Operations ---
    const result = await prisma.$transaction(async (tx) => {
      // --- a. Verify that the LocalFee and all Students exist ---
      const feeExists = await tx.localFees.findUnique({ where: { id: localFeesId } });
      if (!feeExists) {
        throw new Error(`The local fee with ID ${localFeesId} was not found.`);
      }

      const studentsExistCount = await tx.student.count({ where: {id: {in: studentIds}} });
      if (studentsExistCount !== studentIds.length) {
        throw new Error('One or more of the provided student IDs do not exist.');
      }

      // --- b. Find the entire payment schedule (all ClassFees) for this LocalFee ---
      const classFeeSchedule = await tx.classFee.findMany({
        where: { localFeesId: localFeesId },
        select: { id: true },
      });

      if (classFeeSchedule.length === 0) {
        throw new Error(`Cannot assign fee: No payment schedule (ClassFee records) found for local fee ID ${localFeesId}.`);
      }
      const classFeeIds = classFeeSchedule.map(cf => cf.id);

      // --- c. Find existing student-fee links to separate create/update logic ---
      const existingLinks = await tx.localFeesOnStudent.findMany({
        where: { localFeesId: localFeesId, studentId: {in: studentIds} },
        select: { studentId: true },
      });
      const existingStudentIds = new Set(existingLinks.map(link => link.studentId));

      const studentIdsToUpdate = studentIds.filter(id => existingStudentIds.has(id));
      const studentIdsToCreate = studentIds.filter(id => !existingStudentIds.has(id));

      // --- d. Perform bulk update for existing student links ---
      let updatedCount = 0;
      if (studentIdsToUpdate.length > 0) {
        const updateResult = await tx.localFeesOnStudent.updateMany({
          where: {
            localFeesId: localFeesId,
            studentId: {in: studentIdsToUpdate},
          },
          data: { offsetFee: offsetFee }, // Only update the offset
        });
        updatedCount = updateResult.count;
      }

      // --- e. Perform bulk create for new student links and their billable items ---
      let createdCount = 0;
      if (studentIdsToCreate.length > 0) {
        // Create the LocalFeesOnStudent links first
        const studentFeeLinksToCreate = studentIdsToCreate.map(studentId => ({
          studentId: studentId,
          localFeesId: localFeesId,
          offsetFee: offsetFee,
        }));
        const createStudentLinksResult = await tx.localFeesOnStudent.createMany({
          data: studentFeeLinksToCreate,
        });
        createdCount = createStudentLinksResult.count;

        // Now, prepare the full set of FeesCollection records for the new students
        const feesCollectionToCreate: Prisma.FeesCollectionCreateManyInput[] = [];
        for (const studentId of studentIdsToCreate) {
          for (const classFeeId of classFeeIds) {
            feesCollectionToCreate.push({
              classFeeId: classFeeId,
              studentId: studentId,
              status: PaymentStatus.PENDING,
            });
          }
        }

        // Bulk-create all the new bills at once
        if (feesCollectionToCreate.length > 0) {
          await tx.feesCollection.createMany({
            data: feesCollectionToCreate,
            skipDuplicates: true // Important for safety
          });
        }
      }

      // --- f. Return a detailed result ---
      return {
        message: 'Fee assignment and billing operation completed.',
        createdCount,
        updatedCount,
      };
    });

    return NextResponse.json(result, {status: 200});

  } catch (error: any) {
    console.error('Error assigning local fee to students:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { // Unique constraint violation
        const fields = (error.meta as {target?: string[]})?.target?.join(', ');
        return NextResponse.json({ error: `Database unique constraint failed on fields: ${fields}.` }, {status: 409});
      }
    }

    // Custom error messages for better frontend feedback
    if (error.message.includes('not found') || error.message.includes('not exist') || error.message.includes('No payment schedule')) {
      return NextResponse.json({error: error.message}, {status: 404});
    }

    return NextResponse.json(
      {error: 'An unexpected error occurred.'},
      {status: 500}
    );
  }
}

interface DeletionRecord {
  localFeeOnStudentId: string;
  studentId: string;
}

interface DeletionRecord {
  localFeeOnStudentId: string;
  studentId: string;
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const records: DeletionRecord[] = body.records;

    // --- 1. Input Validation (Unchanged) ---
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        {error: 'The request body must contain a non-empty `records` array.'},
        {status: 400}
      );
    }
    for (const record of records) {
      if (!record.localFeeOnStudentId || !record.studentId) {
        return NextResponse.json(
          {error: 'Each object in the array must contain both `localFeeOnStudentId` and `studentId`.'},
          {status: 400}
        );
      }
    }


    const result = await prisma.$transaction(async (tx) => {
      // --- a. First, find the valid records to delete and get their associated localFeesId ---
      const recordsToDelete = await tx.localFeesOnStudent.findMany({
        where: {
          OR: records.map(record => ({
            id: record.localFeeOnStudentId,
            studentId: record.studentId,
          })),
        },
        select: {
          id: true,
          studentId: true,
          localFeesId: true,
        },
      });

      if (recordsToDelete.length === 0) {
        // No records matched the input, so there's nothing to do.
        return {deletedLinksCount: 0, deletedBillsCount: 0};
      }

      const uniqueLocalFeeIds = [...new Set(recordsToDelete.map(r => r.localFeesId))];
      const relatedClassFees = await tx.classFee.findMany({
        where: { localFeesId: { in: uniqueLocalFeeIds } },
        select: { id: true, localFeesId: true },
      });

      const classFeeMap = new Map<string, string[]>();
      for (const cf of relatedClassFees) {
        const ids = classFeeMap.get(cf.localFeesId!) || [];
        ids.push(cf.id);
        classFeeMap.set(cf.localFeesId!, ids);
      }

      // --- c. Construct the precise WHERE clause to delete the correct FeesCollection records ---
      const feesCollectionDeletionConditions: Prisma.FeesCollectionWhereInput[] = [];
      for (const record of recordsToDelete) {
        const classFeeIds = classFeeMap.get(record.localFeesId);
        if (classFeeIds && classFeeIds.length > 0) {
          // This condition targets bills for a specific student for a specific fee schedule.
          feesCollectionDeletionConditions.push({
            studentId: record.studentId,
            classFeeId: { in: classFeeIds },
          });
        }
      }

      let deletedBillsCount = 0;
      if (feesCollectionDeletionConditions.length > 0) {
        const deleteBillsResult = await tx.feesCollection.deleteMany({
          where: { OR: feesCollectionDeletionConditions },
        });
        deletedBillsCount = deleteBillsResult.count;
      }

      const idsToDelete = recordsToDelete.map(r => r.id);
      const deleteLinksResult = await tx.localFeesOnStudent.deleteMany({
        where: { id: { in: idsToDelete } },
      });

      return {
        deletedLinksCount: deleteLinksResult.count,
        deletedBillsCount,
      };
    });

    if (result.deletedLinksCount === 0) {
      return NextResponse.json(
        {message: 'No matching student fee links found to delete.', ...result},
        {status: 404}
      );
    }

    return NextResponse.json(
      {message: 'Student fee links and associated bills deleted successfully.', ...result},
      {status: 200}
    );

  } catch (error: any) {
    console.error('Failed to bulk delete student fee links:', error);
    return NextResponse.json(
      {error: 'An unexpected error occurred.'},
      {status: 500}
    );
  } finally {
    await prisma.$disconnect();
  }
}



export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const motherClassId = searchParams.get('motherClassId') as string;
    if (!motherClassId) {
      return NextResponse.json({error: "Missing required fields"}, {status: 400})
    }

    const globalClassFee = await prisma.classFee.findMany({
      where: {
        motherClassId
      },
      include: {
        globalFees: true
      }
    });

    console.log("globalClassFee: ", globalClassFee)

    return NextResponse.json({globalClassFees: globalClassFee}, {status: 200});

  } catch (e) {
    console.log("Error in GET: ", e);

    return NextResponse.json({error: "Internal server error. Please try again later."}, {status: 500});
  }
}