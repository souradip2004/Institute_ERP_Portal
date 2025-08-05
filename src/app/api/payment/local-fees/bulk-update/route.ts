import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { studentId, localFeesId, incrementOffset } = body;

    // --- 1. Input Validation ---
    if (!studentId || !localFeesId) {
      return NextResponse.json(
        { error: 'studentId and localFeesId are required.' },
        { status: 400 }
      );
    }

    if (typeof incrementOffset !== 'number') {
      return NextResponse.json(
        { error: 'incrementOffset must be a number.' },
        { status: 400 }
      );
    }

    // --- 2. Prisma Update Query ---
    // This query targets the specific join table record and atomically
    // increments the 'offsetFee' field.
    const updatedRecord = await prisma.localFeesOnStudent.update({
      where: {
        // Use the compound unique key for efficient lookup
        localFeesId_studentId: {
          localFeesId: localFeesId,
          studentId: studentId,
        },
      },
      data: {
        offsetFee: {
          increment: incrementOffset,
        },
      },
    });

    // --- 3. Return Success Response ---
    return NextResponse.json(
      {
        message: 'Student fee offset updated successfully.',
        data: updatedRecord,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // --- 4. Handle Specific Prisma Error ---
    // Prisma throws a P2025 error when the record to update is not found.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          {
            error:
              'Record not found. The specified studentId and localFeesId combination does not exist.',
          },
          { status: 404 }
        );
      }
    }

    // --- 5. Handle Generic Errors ---
    console.error('Failed to update fee offset:', error); // Server-side logging
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}