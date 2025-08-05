import {NextResponse} from 'next/server';
import {Prisma, PaymentStatus} from '@prisma/client';
import prisma from '@/lib/prisma';

interface LocalFee {
  name: string;
  description?: string;
  amount: number;
  taxPercentage: number;
  paymentterms: string;
  penalty?: number;
  motherClassId: string;
  studentIds: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      localFees,
      institutionId // Assuming institutionId might be used for validation later
    }: {
      localFees: LocalFee[];
      institutionId: string;
    } = body;

    // --- Start: Existing Validation (Largely Unchanged) ---
    if (!institutionId) {
      return NextResponse.json({error: "Institution id required"}, {status: 400});
    }

    // Validate all incoming local fee objects
    for (const localFee of localFees) {
      const {
        name,
        amount,
        taxPercentage,
        paymentterms,
        motherClassId,
        studentIds
      } = localFee;

      if (!name || amount == null || taxPercentage == null || !paymentterms || !motherClassId || !Array.isArray(studentIds) || studentIds.length === 0 || studentIds.some(id => !id)) {
        return NextResponse.json({error: 'Missing required fields in one or more fee objects.'}, {status: 400});
      }
    }

    // Validate that all specified mother classes exist
    const allMotherClassIds = new Set<string>();
    localFees.forEach(fee => allMotherClassIds.add(fee.motherClassId));

    const existingMotherClasses = await prisma.motherClass.findMany({
      where: {id: {in: Array.from(allMotherClassIds)}},
      select: {id: true}
    });

    if (existingMotherClasses.length !== allMotherClassIds.size) {
      return NextResponse.json({error: "One or more motherClassIds provided do not exist."}, {status: 404});
    }

    // (Optional) Validate that all studentIds exist. This adds robustness.
    const allStudentIds = new Set<string>();
    localFees.forEach(fee => fee.studentIds.forEach(id => allStudentIds.add(id)));
    const existingStudents = await prisma.student.count({
      where: { id: { in: Array.from(allStudentIds) } }
    });
    if (existingStudents !== allStudentIds.size) {
      return NextResponse.json({ error: "One or more studentIds provided do not exist." }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const createdLocalFeesResult = [];

      for (const fee of localFees) {
        const createdFee = await tx.localFees.create({
          data: {
            name: fee.name,
            description: fee.description,
            amount: fee.amount,
            taxPercentage: fee.taxPercentage,
            paymentterms: fee.paymentterms,
            penalty: fee.penalty
          }
        });

        // Step 2: Create the ClassFee link to get its ID.
        // This is crucial for linking to FeesCollection.
        const newClassFee = await tx.classFee.create({
          data: {
            localFeesId: createdFee.id,
            motherClassId: fee.motherClassId
          }
        });

        // Step 3: Create the links between the LocalFee and the students (existing functionality).
        const linkFeeOnStudentData = fee.studentIds.map(studentId => ({
          localFeesId: createdFee.id,
          studentId: studentId
        }));

        await tx.localFeesOnStudent.createMany({
          data: linkFeeOnStudentData,
          skipDuplicates: true // Good practice to avoid errors
        });

        // Step 4: NEW LOGIC - Create a FeesCollection record for each student.
        const feesCollectionToCreate = fee.studentIds.map(studentId => ({
          classFeeId: newClassFee.id,
          studentId: studentId,
          amount: fee.amount, // The amount due
          paymentDate: new Date(), // NOTE: See explanation below on why this might need changing
          paymentMethod: "",
          status: PaymentStatus.PENDING,
          transactionId: null
        }));

        if (feesCollectionToCreate.length > 0) {
          await tx.feesCollection.createMany({
            data: feesCollectionToCreate,
            skipDuplicates: true
          });
        }

        createdLocalFeesResult.push(createdFee);
      }

      return createdLocalFeesResult;
    });


    return NextResponse.json(result, {status: 201});
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          const metaTarget = (error.meta as { target?: string[] })?.target;
          return NextResponse.json(
            {error: `A record with this information already exists. Please check for duplicates. (Constraint: ${metaTarget?.join(', ')})`},
            {status: 409}
          );
        case 'P2003':
          const fieldName = (error.meta as { field_name?: string })?.field_name;
          return NextResponse.json(
            {error: `Failed to create records. An invalid ID was provided for the '${fieldName}' field.`},
            {status: 400}
          );
        default:
          console.warn(`Unhandled Prisma Error Code: ${error.code}`);
          break;
      }
    }

    console.log("Error creating local fees: ", error);

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

        return tx.localFees.update({
          where: {id},
          data: dataToUpdate
        });
      });

      const updatedFees = await Promise.all(updatePromises);
      return updatedFees;
    });

    return NextResponse.json(result, {status: 200});

  } catch (error) {
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
    const studentId = searchParams.get('studentId') as string;

    if (!studentId) {
      return NextResponse.json({error : "studentId required!"}, {status: 400});
    }

    /*const localFees = await prisma.classFee.findMany({
      where: {
        motherClassId,
        localFees: {
          isNot: null
        }
      },
      include: {
        localFees: {
          include: {
            studentsLocalFees: true
          }
        }
      }
    });*/

    const studentLocalFee = await prisma.localFeesOnStudent.findMany({
      where: {
        studentId
      },
      select: {
        id: true,
        localFeesId: true,
        studentId: true,
        localFees: {
          select: {
            id: true,
            name: true,
            amount: true,
            taxPercentage: true,
            paymentterms: true,
            penalty: true
          }
        }
      },
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