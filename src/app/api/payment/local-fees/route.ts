import {NextResponse} from 'next/server';
import {Prisma, PaymentStatus} from '@prisma/client';
import prisma from '@/lib/prisma';

interface LocalFee {
  name: string;
  description?: string;
  amount: number;
  taxPercentage: number;
  paymentterms: string;
  penalty: number;
  motherClassId: string;
  studentIds: string[];
}

export async function POST(request: Request) {
  try {

    const body = await request.json();
    const {
      localFees,
      institutionId
    }: {
      localFees: LocalFee[];
      institutionId: string;
    } = body;

    if (!institutionId) {
      return NextResponse.json({error: "Institution id required"}, {status: 400});
    }

    for (const localFee of localFees) {
      const {
        name,
        amount,
        taxPercentage,
        paymentterms,
        motherClassId,
        studentIds,
        penalty
      } = localFee as LocalFee;

      if (!name || !amount || !taxPercentage || !paymentterms || !institutionId || !motherClassId || !Array.isArray(studentIds) || studentIds.length === 0) {
        return NextResponse.json({error: 'Missing required fields'}, {status: 400});
      }
    }

    const result = await prisma.$transaction(async (tx) => {

      const allMotherClassIds = new Set<string>();
      localFees.forEach(fee => allMotherClassIds.add(fee.motherClassId));

      const existingMotherClasses = await tx.motherClass.findMany({
        where: {id: {in: Array.from(allMotherClassIds)}},
        select: {id: true}
      });

      if (existingMotherClasses.length !== allMotherClassIds.size) {
        return NextResponse.json({error: "One or more motherClassIds provided do not exist."}, {status: 404});
      }

      const instituteFeesDetail = await tx.fees.findUnique({
        where: {
          institutionId
        }
      });

      if (!instituteFeesDetail) {
        throw new Error("Institute fee detail not found.");
      }


      const localFees = await tx.localFees.createMany({
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

    const localFees = prisma.classFee.findMany({
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