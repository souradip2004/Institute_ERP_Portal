import {NextResponse} from 'next/server';
import {Prisma, PaymentStatus} from '@prisma/client';
import prisma from '@/lib/prisma';

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
      studentIds,
    } = body;

    if (!name || !amount || !taxPercentage || !paymentterms || !institutionId || !motherClassId || !Array.isArray(studentIds) || studentIds.length === 0) {
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
      const instituteFeesDetail = await tx.fees.findUnique({
        where: {
          institutionId
        }
      });

      if (!instituteFeesDetail) {
        throw new Error("Institute fee detail not found.");
      }


      const localFees = await tx.localFees.create({
        data: {
          name,
          description,
          amount,
          taxPercentage,
          paymentterms,
          penalty,
          classFees: {
            create: [{
              motherClassId: motherClassId,
              feeCategoryId: instituteFeesDetail.id
            }]
          },
          studentsLocalFees: {
            create: studentIds.map(studentId => ({
              studentId,
            }))
          }
        },
        include: {
          classFees: true,
          studentsLocalFees: true
        }
      })

      return localFees;
    })


    return NextResponse.json(result, {status: 201});
  } catch (error) {
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

    return NextResponse.json(
      {error: 'An internal server error occurred.'},
      {status: 500}
    );
  }
}

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const motherClassId = searchParams.get('motherClassId') as string;

    const localFees = prisma.classFee.findUnique({
      where: {
        motherClassId
      },
      include: {
        localFees: {
          include: {
            studentsLocalFees: true
          }
        }
      }
    })

    return NextResponse.json({globalClassFees: localFees}, {status: 200});

  } catch (e) {

    return NextResponse.json({error: "Internal server error. Please try again later."}, {status: 500});
  }
}