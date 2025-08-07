import {NextResponse} from 'next/server';
import {PaymentStatus, PrismaClient} from '@prisma/client';

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
          error: 'A non-empty studentIds array, a localFeesId, and a numeric offsetFee are required.',
        },
        {status: 400}
      );
    }

    const result = await prisma.$transaction(async (tx) => {

      const classFeeLink = await tx.classFee.findFirst({
        where: {localFeesId: localFeesId},
        select: {id: true}
      });

      if (!classFeeLink) {
        throw new Error(
          `No ClassFee is associated with the provided localFeesId (${localFeesId}).`
        );
      }
      const classFeeId = classFeeLink.id;

      const studentsExistCount = await tx.student.count({
        where: {id: {in: studentIds}}
      });

      if (studentsExistCount !== studentIds.length) {
        throw new Error('One or more of the provided student IDs do not exist.');
      }

      const existingLinks = await tx.localFeesOnStudent.findMany({
        where: {
          localFeesId: localFeesId,
          studentId: {in: studentIds}
        },
        select: {studentId: true},
      });

      const existingStudentIds = new Set(
        existingLinks.map((link) => link.studentId)
      );

      const studentIdsToUpdate = studentIds.filter((id) =>
        existingStudentIds.has(id)
      );
      const studentIdsToCreate = studentIds.filter(
        (id) => !existingStudentIds.has(id)
      );

      let updatedCount = 0;
      if (studentIdsToUpdate.length > 0) {
        const updateResult = await tx.localFeesOnStudent.updateMany({
          where: {
            localFeesId: localFeesId,
            studentId: {in: studentIdsToUpdate},
          },
          data: {offsetFee: offsetFee},
        });
        updatedCount = updateResult.count;
      }

      let createdCount = 0;
      if (studentIdsToCreate.length > 0) {

        const studentFeeLinksToCreate = studentIdsToCreate.map((studentId) => ({
          studentId: studentId,
          localFeesId: localFeesId,
          offsetFee: offsetFee
        }));
        const createStudentLinksResult = await tx.localFeesOnStudent.createMany({
          data: studentFeeLinksToCreate,
        });
        createdCount = createStudentLinksResult.count;

        // --- Create corresponding FeesCollection records for the new links ---
        const feesCollectionToCreate = studentIdsToCreate.map((studentId) => ({
          classFeeId: classFeeId,
          studentId: studentId,
          status: PaymentStatus.PENDING,
          // Amount defaults to 0 as per schema, paymentDate is optional (null)
        }));
        await tx.feesCollection.createMany({data: feesCollectionToCreate});
      }

      // --- g. Return a detailed result from the transaction ---
      return {
        message: 'Fee assignment and billing operation completed.',
        createdCount,
        updatedCount
      };
    });

    // --- 3. Return Success Response ---
    return NextResponse.json(result, {status: 200});

  } catch (error: any) {
    // --- 4. Handle Errors ---
    return NextResponse.json(
      {error: error.message || 'An unexpected error occurred.'},
      {status: error.message.includes('not found') || error.message.includes('not exist') || error.message.includes('No ClassFee') ? 404 : 500}
    );
  }
}


interface DeletionRecord {
  localFeeOnStudentId: string;
  studentId: string;
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const recordsToDelete: DeletionRecord[] = body.records;

    // --- 1. Input Validation ---
    if (!Array.isArray(recordsToDelete) || recordsToDelete.length === 0) {
      return NextResponse.json(
        {
          error:
            'The request body must contain a non-empty `records` array.',
        },
        { status: 400 }
      );
    }

    // Validate the structure of each object in the array
    for (const record of recordsToDelete) {
      if (!record.localFeeOnStudentId || !record.studentId) {
        return NextResponse.json(
          {
            error:
              'Each object in the array must contain both `localFeeOnStudentId` and `studentId`.',
          },
          { status: 400 }
        );
      }
    }

    const whereClause = {
      OR: recordsToDelete.map((record) => ({
        id: record.localFeeOnStudentId,
        studentId: record.studentId,
      })),
    };

    const deleteResult = await prisma.localFeesOnStudent.deleteMany({
      where: whereClause,
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        {
          message: 'No matching records found to delete.',
          deletedCount: 0
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Student fee links deleted successfully.',
        deletedCount: deleteResult.count,
      },
      { status: 200 }
    );
  } catch (error: any) {

    console.error('Failed to bulk delete student fee links:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
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
    })

    console.log("globalClassFee: ", globalClassFee)

    return NextResponse.json({globalClassFees: globalClassFee}, {status: 200});

  } catch (e) {
    console.log("Error in GET: ", e);

    return NextResponse.json({error: "Internal server error. Please try again later."}, {status: 500});
  }
}