import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {Prisma} from "@prisma/client";

interface GlobalFee {
  name: string;
  description?: string;
  amount: number;
  taxPercentage: number;
  paymentterms: string;
  penalty: number;
  motherClassIds: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      globalFees,
      institutionId
    }: {
      globalFees: GlobalFee[];
      institutionId: string;
    } = body;

    for (const globalFee of globalFees) {
      const {
        name,
        amount,
        taxPercentage,
        paymentterms,
        motherClassIds
      } = globalFee;

      if (!name || amount == null || taxPercentage == null || !paymentterms || !institutionId || !Array.isArray(motherClassIds) || motherClassIds.length === 0 || motherClassIds.some(id => !id)) {

        return NextResponse.json({error: 'Missing required fields'}, {status: 400});
      }
    }

    const result = await prisma.$transaction(async (tx) => {

      const allMotherClassIds = new Set<string>();
      globalFees.forEach(fee => fee.motherClassIds.forEach(id => allMotherClassIds.add(id)));

      const existingMotherClasses = await tx.motherClass.findMany({
        where: {id: {in: Array.from(allMotherClassIds)}},
        select: {id: true}
      });

      if (existingMotherClasses.length !== allMotherClassIds.size) {
        return NextResponse.json({error: "One or more motherClassIds provided do not exist."}, {status: 404});
      }

      const globalFeeDataToCreate = globalFees.map(fee => ({
        name: fee.name,
        description: fee.description,
        amount: fee.amount,
        taxPercentage: fee.taxPercentage,
        paymentterms: fee.paymentterms,
        penalty: fee.penalty,
        institutionId
      }));

      const createdGlobalFees = await tx.globalFees.createManyAndReturn({
        data: globalFeeDataToCreate,
      });

      /* const createdGlobalFees = await tx.globalFees.findMany({
          where: {
            institutionId
          },
        });
      */

      const classFeeLinksToCreate: { globalFeesId: string; motherClassId: string }[] = [];
      for (const fee of globalFees) {

        const createdFee = createdGlobalFees.find(gf => gf.name === fee.name);
        if (createdFee) {
          fee.motherClassIds.forEach(motherClassId => {
            classFeeLinksToCreate.push({
              globalFeesId: createdFee.id,
              motherClassId: motherClassId
            });
          });
        }
      }

      await tx.classFee.createMany({
        data: classFeeLinksToCreate
      });

      return createdGlobalFees;
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
            {status: 409}
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

interface GlobalFeeUpdatePayload {
  id: string;
  name?: string;
  amount?: number;
  taxPercentage?: number;
  paymentterms?: string;
  institutionId: string;
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      globalFeesToUpdate
    }: {
      globalFeesToUpdate: GlobalFeeUpdatePayload[];

    } = body;


    if (!Array.isArray(globalFeesToUpdate) || globalFeesToUpdate.length === 0) {
      return NextResponse.json({error: 'Missing required fields: institutionId and a non-empty globalFeesToUpdate array are required.'}, {status: 400});
    }
    if (globalFeesToUpdate.some(fee => !fee.id || !fee.institutionId)) {
      return NextResponse.json({error: 'Every fee object in the update array must have an ID.'}, {status: 400});
    }

    const updatedFees = await prisma.$transaction(async (tx) => {
      const results = [];

      const instituteExists = await tx.institution.findUnique({
        where: {
          id: globalFeesToUpdate[0].institutionId
        }
      });

      if (!instituteExists) {
        return NextResponse.json({error: "Institute doesn't exists."}, {status: 404});
      }

      for (const fee of globalFeesToUpdate) {
        const {id, institutionId, ...dataToUpdate} = fee;
        // console.log("dataToUpdate: ", dataToUpdate)

        const updatedFee = await tx.globalFees.update({
          where: {
            id: id,
            institutionId: institutionId
          },
          data: {
            ...dataToUpdate
          },
        });
        results.push(updatedFee);
      }

      return results;
    });

    return NextResponse.json(updatedFees, {status: 200});

  } catch (error) {
    console.error('Error updating global fees:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle the specific case where a fee to update was not found.
      // This happens if an ID is invalid or doesn't belong to the institution.
      if (error.code === 'P2025') {
        return NextResponse.json(
          {error: 'One or more fees to update were not found. Please check the IDs and institutionId.'},
          {status: 404} // 404 Not Found is appropriate here
        );
      }

      // Handle cases where a unique constraint is violated (e.g., duplicate name)
      if (error.code === 'P2002') {
        return NextResponse.json(
          {error: 'Update failed because it would create a duplicate record (e.g., a fee with that name already exists).'},
          {status: 409}
        );
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

    if (!motherClassId) {
      return NextResponse.json({error: "Missing required fields"}, {status: 400})
    }

    const globalClassFee = await prisma.classFee.findMany({
      where: {
        motherClassId
      },
      include: {
        globalFees: true
      }
    })

    console.log("globalClassFee: ", globalClassFee)

    return NextResponse.json({globalClassFees: globalClassFee}, {status: 200});

  } catch (e) {
    console.log("Error in GET: ", e);

    return NextResponse.json({error: "Internal server error. Please try again later."}, {status: 500});
  }
}