import {NextResponse} from 'next/server';
import {PaymentStatus, PrismaClient} from '@prisma/client';
import {Prisma} from '@prisma/client';

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
        where: {id: {in: studentIds}},
      });

      if (studentsExistCount !== studentIds.length) {
        throw new Error('One or more of the provided student IDs do not exist.');
      }

      const existingLinks = await tx.localFeesOnStudent.findMany({
        where: {
          localFeesId: localFeesId,
          studentId: {in: studentIds},
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

      // --- f. Perform create operations for new links ---
      let createdCount = 0;
      if (studentIdsToCreate.length > 0) {
        // --- Create LocalFeesOnStudent records ---
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


export async function DELETE(
  request: Request
) {
  try {
    const body = await request.json();
    const {studentId, localFeeOnStudentId} = body;

    // --- 1. Input Validation ---
    if (!localFeeOnStudentId) {
      return NextResponse.json(
        {error: 'The localFeeOnStudentId is required in the URL.'},
        {status: 400}
      );
    }
    if (!studentId) {
      return NextResponse.json(
        {error: 'The studentId is required in the request body.'},
        {status: 400}
      );
    }

    await prisma.localFeesOnStudent.delete({
      where: {
        id: localFeeOnStudentId,
        studentId: studentId,
      },
    });


    return NextResponse.json(
      {message: 'Student fee link deleted successfully.'},
      {status: 200}
    );
  } catch (error: any) {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {

      // but the studentId doesn't match.
      if (error.code === 'P2025') {
        return NextResponse.json(
          {error: 'The specified student fee link was not found or does not belong to the student.'},
          {status: 404}
        );
      }
    }

    console.error('Failed to delete student fee link:', error); // Server-side logging
    return NextResponse.json(
      {error: 'An unexpected error occurred.'},
      {status: 500}
    );
  }
}