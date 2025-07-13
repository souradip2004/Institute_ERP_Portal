import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { globalFeesId, classSectionIds } = body;

    if (!globalFeesId || !classSectionIds || !Array.isArray(classSectionIds) || classSectionIds.length === 0) {
      return NextResponse.json(
        { error: '`globalFeesId` (string) and `classSectionIds` (non-empty array) are required.' },
        { status: 400 }
      );
    }

    const dataToCreate = classSectionIds.map((sectionId: string) => ({
      globalFeesId: globalFeesId,
      classSectionId: sectionId,
    }));

    const result = await prisma.classFee.createMany({
      data: dataToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Error creating class fees:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Failed to create records. Ensure the `globalFeesId` and all `classSectionIds` exist.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}