import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentIds, localFeesId, offsetFee } = body;

    // --- 1. Input Validation ---
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
        { status: 400 }
      );
    }

    // --- 2. Use a Transaction for Atomicity ---
    const result = await prisma.$transaction(async (tx) => {
      // --- a. Verify that all related records exist to prevent errors ---
      const feeExists = await tx.localFees.findUnique({
        where: { id: localFeesId },
        include: {
          classFees: true
        }
      });
      if (!feeExists) {
        throw new Error(`The local fee was not found.`);
      }



      const studentsExistCount = await tx.student.count({
        where: { id: { in: studentIds } },
      });
      if (studentsExistCount !== studentIds.length) {
        throw new Error('One or more of the provided student IDs do not exist.');
      }

      // --- b. Find which students from the list are already linked to this fee ---
      const existingLinks = await tx.localFeesOnStudent.findMany({
        where: {
          localFeesId: localFeesId,
          studentId: { in: studentIds },
        },
        select: {
          studentId: true,
        },
      });

      const existingStudentIds = new Set(
        existingLinks.map((link) => link.studentId)
      );

      // --- c. Partition student IDs into two groups: those to update and those to create ---
      const studentIdsToUpdate = studentIds.filter((id) =>
        existingStudentIds.has(id)
      );
      const studentIdsToCreate = studentIds.filter(
        (id) => !existingStudentIds.has(id)
      );

      // --- d. Perform the bulk update operation ---
      let updatedCount = 0;
      if (studentIdsToUpdate.length > 0) {
        const updateResult = await tx.localFeesOnStudent.updateMany({
          where: {
            localFeesId: localFeesId,
            studentId: { in: studentIdsToUpdate },
          },
          data: {
            offsetFee: offsetFee, // Set the offset to the new value
          },
        });
        updatedCount = updateResult.count;
      }

      // --- e. Perform the bulk create operation ---
      let createdCount = 0;
      if (studentIdsToCreate.length > 0) {
        const dataToCreate = studentIdsToCreate.map((studentId) => ({
          studentId: studentId,
          localFeesId: localFeesId,
          offsetFee: offsetFee,
        }));

        const createResult = await tx.localFeesOnStudent.createMany({
          data: dataToCreate,
        });
        createdCount = createResult.count;
      }

      // --- f. Return a detailed result from the transaction ---
      return {
        message: 'Fee link upsert operation completed.',
        createdCount,
        updatedCount,
      };
    });

    // --- 3. Return Success Response ---
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    // --- 4. Handle Errors ---
    // This will catch errors thrown from our transaction or other unexpected errors.
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      // Use a 404 if a resource wasn't found, otherwise a generic 500
      { status: error.message.includes('not found') || error.message.includes('do not exist') ? 404 : 500 }
    );
  }
}


export async function DELETE(
  request: Request
) {
  try {
    const body = await request.json();
    const { studentId, localFeeOnStudentId } = body;

    // --- 1. Input Validation ---
    if (!localFeeOnStudentId) {
      return NextResponse.json(
        { error: 'The localFeeOnStudentId is required in the URL.' },
        { status: 400 }
      );
    }
    if (!studentId) {
      return NextResponse.json(
        { error: 'The studentId is required in the request body.' },
        { status: 400 }
      );
    }

    await prisma.localFeesOnStudent.delete({
      where: {
        id: localFeeOnStudentId,
        studentId: studentId,
      },
    });


    return NextResponse.json(
      { message: 'Student fee link deleted successfully.' },
      { status: 200 }
    );
  } catch (error: any) {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: "An operation failed because it depends on one or more records
      // that were required but not found. Record to delete does not exist."
      // This error is correctly thrown if the ID doesn't exist OR if the ID exists
      // but the studentId doesn't match.
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'The specified student fee link was not found or does not belong to the student.' },
          { status: 404 }
        );
      }
    }

    console.error('Failed to delete student fee link:', error); // Server-side logging
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}