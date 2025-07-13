import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      amount,
      taxPercentage,
      paymentterms,
      penalty = 0, // Set default value
      institutionId,
      motherClassId,
    } = body;

    if (!name || amount == null || taxPercentage == null || !paymentterms || !institutionId || !motherClassId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find all class sections belonging to the specified mother class
      const classSections = await tx.classSection.findMany({
        where: { motherClassId: motherClassId },
        select: { id: true }
      });

      if (classSections.length === 0) {
        throw new Error('No class sections found for the specified mother class. Fee cannot be applied.');
      }

      const newGlobalFee = await tx.globalFees.create({
        data: {
          name,
          description,
          amount,
          taxPercentage,
          paymentterms,
          penalty,
          institutionId: institutionId,
          motherClassId: motherClassId,
          // Create a ClassFee for each section found
          classFees: {
            create: classSections.map((section) => ({
              classSectionId: section.id,
            })),
          },
        },
        include: {
          // Include the created classFees in the response
          classFees: true,
        },
      });
      return newGlobalFee;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Error creating global fee:', error);
    // Provide a more specific error message if our custom error was thrown
    if (error instanceof Error && error.message.includes('No class sections found')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}