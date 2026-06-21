import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, props: { params: Promise<{ motherClassId: string }> }) {
  const params = await props.params;
  try {
    const { motherClassId } = params;

    if (!motherClassId) {
      return NextResponse.json(
        { error: 'Mother Class ID is required.' },
        { status: 400 }
      );
    }

    const localFees = await prisma.localFees.findMany({
      where: {
        classFees: {
          some: {
            motherClassId: motherClassId,
          },
        },
      },
    });

    // --- 3. Handle Case Where No Fees Are Found ---
    if (!localFees || localFees.length === 0) {
      return NextResponse.json(
        {
          message: 'No local fees found for the specified mother class.',
          data: [],
        },
        { status: 404 }
      );
    }

    // --- 4. Return Success Response ---
    return NextResponse.json(
      {
        message: 'Local fees fetched successfully.',
        data: localFees,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // --- 5. Handle Errors ---
    console.error('Failed to fetch local fees:', error); // For server-side logging
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching local fees.' },
      { status: 500 }
    );
  }
}