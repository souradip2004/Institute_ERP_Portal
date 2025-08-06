import {NextResponse} from 'next/server';
import {Prisma, PaymentStatus} from '@prisma/client';
import prisma from '@/lib/prisma';

interface LocalFees {
  name: string;
  description?: string;
  amount: number;
  taxPercentage: number;
  paymentterms: string;
  penalty?: number;
  motherClassId: string;
  dueDate: string;
  studentIds: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      localFees,
      institutionId, // Kept for potential future validation or logging
    }: {
      localFees: LocalFees[];
      institutionId: string;
    } = body;

    // --- 1. Input Validation ---
    if (!institutionId) {
      return NextResponse.json(
        {error: 'Institution ID is required.'},
        {status: 400}
      );
    }

    if (!Array.isArray(localFees) || localFees.length === 0) {
      return NextResponse.json(
        {error: 'A non-empty localFees array is required.'},
        {status: 400}
      );
    }

    // Validate all incoming local fee objects
    for (const fee of localFees) {
      const {name, amount, taxPercentage, paymentterms, motherClassId} = fee;
      if (
        !name ||
        amount == null ||
        taxPercentage == null ||
        !paymentterms ||
        !motherClassId
      ) {
        return NextResponse.json(
          {error: 'Missing required fields in one or more fee objects.'},
          {status: 400}
        );
      }
    }

    // --- 2. Validate that all specified MotherClasses exist ---
    const allMotherClassIds = new Set<string>(
      localFees.map((fee) => fee.motherClassId)
    );

    const existingMotherClassesCount = await prisma.motherClass.count({
      where: {id: {in: Array.from(allMotherClassIds)}},
    });

    if (existingMotherClassesCount !== allMotherClassIds.size) {
      return NextResponse.json(
        {error: 'One or more motherClassIds provided do not exist.'},
        {status: 404}
      );
    }

    // --- 3. Transaction to create fees and link them to classes ---
    const result = await prisma.$transaction(async (tx) => {
      const createdFeesResult = [];

      for (const fee of localFees) {
        // --- a. Create the LocalFees record ---
        const createdFee = await tx.localFees.create({
          data: {
            name: fee.name,
            description: fee.description,
            amount: fee.amount,
            taxPercentage: fee.taxPercentage,
            paymentterms: fee.paymentterms,
            penalty: fee.penalty, // Prisma handles undefined values correctly
          },
        });

        // --- b. Create the ClassFee record to link the new fee to the MotherClass ---
        const createdClassFee = await tx.classFee.create({
          data: {
            localFeesId: createdFee.id,
            motherClassId: fee.motherClassId,
            dueDate: new Date(fee.dueDate)
          },
        });

        // Push the fully created fee object to our results array
        createdFeesResult.push({...createdFee, dueDate: createdClassFee.dueDate});
      }

      return createdFeesResult;
    });

    // --- 4. Return Success Response ---
    return NextResponse.json(
      {
        message: 'Local fees created and linked to classes successfully.',
        data: result,
      },
      {status: 201}
    );
  } catch (error) {
    // --- 5. Robust Error Handling (Unchanged) ---
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': // Unique constraint failed
          const metaTarget = (error.meta as { target?: string[] })?.target;
          return NextResponse.json(
            {
              error: `A record with this information already exists. (Constraint: ${metaTarget?.join(', ')})`,
            },
            {status: 409}
          );
        case 'P2003': // Foreign key constraint failed
          const fieldName = (error.meta as { field_name?: string })?.field_name;
          return NextResponse.json(
            {
              error: `Failed to create records. An invalid ID was provided for the '${fieldName}' field.`,
            },
            {status: 400}
          );
        default:
          console.warn(`Unhandled Prisma Error Code: ${error.code}`);
          break;
      }
    }

    console.error("Error creating local fees: ", error);

    return NextResponse.json(
      {error: 'An internal server error occurred.'},
      {status: 500}
    );
  }
}

interface UpdateLocalFeePayload {
  id: string;
  name?: string;
  description?: string;
  amount?: number;
  taxPercentage?: number;
  paymentterms?: string;
  penalty?: number;
  classFeesId?: string;
  dueDate?: string;
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {localFees}: { localFees: UpdateLocalFeePayload[] } = body;

    if (!localFees || !Array.isArray(localFees) || localFees.length === 0) {
      return NextResponse.json(
        {error: 'An array of localFees to update is required.'},
        {status: 400}
      );
    }

    const result = await prisma.$transaction(async (tx) => {

      const updatePromises = localFees.map((fee) => {
        const {id, ...dataToUpdate} = fee;

        if (!id) {
          throw new Error('Each fee object in the array must have an ID.');
        }

        if (fee.classFeesId && !fee.dueDate) {
          throw new Error('Due date is required for classFeesId');
        }


        return tx.localFees.update({
          where: {id: id},
          data: {
            ...dataToUpdate,
            classFees: {
              update: {
                where: {
                  id: fee.classFeesId,
                },
                data: {
                  // Set the new due date on that ClassFee record
                  dueDate: fee.dueDate ? new Date(fee.dueDate) : undefined
                },
              },
            },
          },
        });
      });
    });


    const updatedFees = await Promise.all(updatePromises);
    return updatedFees;
  }
)
  ;

  return NextResponse.json(result, {status: 200});

}

catch
(error)
{
  if (error instanceof Prisma.PrismaClientKnownRequestError) {

    if (error.code === 'P2025') {
      const errorMessage = (error.meta as { cause?: string })?.cause || 'Record not found.';
      return NextResponse.json(
        {error: `Update failed: ${errorMessage}`},
        {status: 404}
      );
    }
  }

  if (error instanceof Error && error.message.includes('must have an ID')) {
    return NextResponse.json({error: error.message}, {status: 400});
  }

  console.error("Error updating local fees: ", error);

  return NextResponse.json(
    {error: 'An internal server error occurred.'},
    {status: 500}
  );
}
}

export async function DELETE(request: Request) {
  try {

    const {searchParams} = new URL(request.url);
    const localFeesId = searchParams.get('localFeesId') as string;

    if (!localFeesId) {
      return NextResponse.json({error: "localFeesId required !"}, {status: 400});
    }

    const deleted = await prisma.localFees.delete({
      where: {
        id: localFeesId
      }
    });

    console.log("deleted: ", deleted);

    return NextResponse.json(deleted, {status: 200});

  } catch (e: any) {
    console.log("Error ", e);

    return NextResponse.json({error: "Internal server error", message: e.message})
  }
}

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const motherClassId = searchParams.get('motherClassId') as string;

    const studentLocalFee = await prisma.localFees.findMany({
      where: {
        classFees: {
          some: {
            motherClassId: motherClassId
          }
        }
      },
      include: {
        classFees: {
          select: {
            id: true,
            dueDate: true
          }
        }
      }
    })

    console.log("studentLocalFee: ", studentLocalFee);


    return NextResponse.json(studentLocalFee, {status: 200});

  } catch (e: any) {

    return NextResponse.json({
      error: "Internal server error. Please try again later.",
      message: e.message
    }, {status: 500});
  }
}