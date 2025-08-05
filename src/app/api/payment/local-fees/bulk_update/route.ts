import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { studentIds, incrementAmt, penaltyValue } = body;


    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'studentIds must be a non-empty array.' },
        { status: 400 }
      );
    }

    if (typeof incrementAmt !== 'number' || typeof penaltyValue !== 'number') {
      return NextResponse.json(
        { error: 'incrementAmt and penaltyValue must be numbers.' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // --- a. Verify all students have LocalFees ---
      const studentFeesLinks = await tx.localFeesOnStudent.findMany({
        where: {
          studentId: {
            in: studentIds,
          },
        },
        select: {
          studentId: true,
          localFeesId: true,
        }
      });

      const foundStudentIds = new Set(studentFeesLinks.map(link => link.studentId));
      const missingStudents = studentIds.filter(id => !foundStudentIds.has(id));

      if (missingStudents.length > 0) {
        // If any student is not found, throw an error to automatically roll back the transaction.
        throw new Error(`Error: No LocalFeesOnStudent records found for the following students: ${missingStudents.join(', ')}.`);
      }

      // --- b. Get all unique LocalFees IDs to update ---
      const localFeesIdsToUpdate = [
        ...new Set(studentFeesLinks.map((link) => link.localFeesId)),
      ];

      if (localFeesIdsToUpdate.length === 0) {
        return { message: "No local fees associated with the provided students to update." };
      }

      // --- c. Increment amount and penalty for all related LocalFees ---
      const updatedFees = await tx.localFees.updateMany({
        where: {
          id: {
            in: localFeesIdsToUpdate,
          },
        },
        data: {
          amount: {
            increment: incrementAmt,
          },
          penalty: {
            increment: penaltyValue,
          },
        },
      });

      return {
        message: "Fees updated successfully.",
        updatedCount: updatedFees.count,
        updatedFeesIds: localFeesIdsToUpdate
      };
    });

    // --- 3. Return Success Response ---
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    // --- 4. Handle Errors ---
    // This will catch errors from the transaction (like the one we throw) or other unexpected errors.
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: error.message.startsWith('Error: No LocalFeesOnStudent') ? 404 : 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}