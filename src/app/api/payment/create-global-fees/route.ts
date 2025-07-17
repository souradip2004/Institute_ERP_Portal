import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {Prisma} from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      amount,
      taxPercentage,
      paymentterms,
      penalty = 0,
      institutionId,
      motherClassId,
      feesId
    } = body;

    if (!name || amount == null || taxPercentage == null || !paymentterms || !institutionId || !motherClassId) {
      return NextResponse.json({error: 'Missing required fields'}, {status: 400});
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find all class sections belonging to the specified mother class
      const motherClass = await tx.motherClass.findUnique({
        where: {
          id: motherClassId,
        }
      })

      if (!motherClass) {
        return NextResponse.json({error: "Class details not found"}, {status: 400});
      }

      const globalFees = await tx.globalFees.create({
        data: {
          name,
          description,
          amount,
          taxPercentage,
          paymentterms,
          penalty,
          institutionId
        }
      });

      const instituteFeesDetail = await tx.fees.findUnique({
        where: {
          institutionId
        }
      });

      if (!instituteFeesDetail) {
        throw new Error("Institute fee detail not found.");
      }


      const classFees = await tx.classFee.create({
        data: {
          globalFeesId: globalFees.id,
          motherClassId: motherClassId,
          feeCategoryId: feesId
        }
      })

      return {
        globalFees,
        classFees
      }

    });

    return NextResponse.json(result, {status: 201});

  } catch (error) {
    console.error('Error creating class fees:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Use a switch statement to handle multiple known error codes
      switch (error.code) {
        case 'P2002':
          // Unique constraint failed (e.g., the fee for this class section already exists)
          return NextResponse.json(
            {error: 'One or more of these class fees already exist.'},
            {status: 409} // 409 Conflict is the appropriate status code
          );

        case 'P2003':
          // Foreign key constraint failed (e.g., `globalFeesId` or a `classSectionId` does not exist)
          const fieldName = (error.meta as { field_name?: string })?.field_name;
          return NextResponse.json(
            {error: `Failed to create records. An invalid ID was provided for the '${fieldName}' field.`},
            {status: 400}
          );

        default:
          // For any other known Prisma error, log the code for debugging
          // and fall through to the generic 500 error.
          console.warn(`Unhandled Prisma Error Code: ${error.code}`);
          break;
      }
    }

    // Fallback for all other errors (including unhandled Prisma errors)
    return NextResponse.json(
      {error: 'An internal server error occurred.'},
      {status: 500}
    );
  }

}