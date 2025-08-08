import {NextResponse} from 'next/server';
import {PrismaClient, Prisma, PaymentStatus} from '@prisma/client';

const prisma = new PrismaClient();

interface AssignGlobalFeePayload {
  globalFeeId: string;
  motherClassIds: string[];
  institutionId: string;
}

/*export async function POST(request: Request) {
  try {
    const body: AssignGlobalFeePayload = await request.json();
    const {globalFeeId, motherClassIds, institutionId} = body;

    if (!globalFeeId || !Array.isArray(motherClassIds) || motherClassIds.length === 0 || !institutionId) {
      return NextResponse.json(
        {error: 'A globalFeeId and a non-empty motherClassIds array are required.'},
        {status: 400}
      );
    }

    // --- 2. Transaction for All-or-Nothing Operation ---
    const result = await prisma.$transaction(async (tx) => {

      const sourceClassFee = await tx.classFee.findFirst({
        where: {globalFeesId: globalFeeId},
        select: {dueDate: true},
      });

      if (!sourceClassFee) {
        throw new Error(
          'Cannot assign fee: No existing ClassFee found for this Global Fee to copy the due date from.'
        );
      }
      const dueDate = sourceClassFee.dueDate;

      // --- b. Validate that all provided MotherClasses exist ---
      const existingMotherClassesCount = await tx.motherClass.count({
        where: {id: {in: motherClassIds}},
      });
      if (existingMotherClassesCount !== motherClassIds.length) {
        throw new Error('One or more of the provided motherClassIds do not exist.');
      }

      // --- c. Prevent creating duplicate links (Idempotency) ---
      const alreadyLinked = await tx.classFee.findMany({
        where: {
          globalFeesId: globalFeeId,
          motherClassId: {in: motherClassIds}
        },
        select: {motherClassId: true}
      });

      const alreadyLinkedIds = new Set(alreadyLinked.map(cf => cf.motherClassId));
      const motherClassIdsToCreate = motherClassIds.filter(id => !alreadyLinkedIds.has(id));

      if (motherClassIdsToCreate.length === 0) {
        return {
          message: "All provided classes are already linked to this fee.",
          createdClassFeeCount: 0,
          createdFeesCollectionCount: 0
        };
      }

      // --- d. Get all enrolled students for the classes to be linked ---
      const studentEnrollments = await tx.studentClassEnrollment.findMany({
        where: {
          classSection: {motherClassId: {in: motherClassIdsToCreate}},
          enrollmentStatus: 'ENROLLED',
        },
        select: {
          studentId: true,
          classSection: {select: {motherClassId: true}},
        },
      });

      const studentsByMotherClass = new Map<string, string[]>();
      for (const enrollment of studentEnrollments) {
        if (enrollment.classSection.motherClassId) {
          const students = studentsByMotherClass.get(enrollment.classSection.motherClassId) || [];
          students.push(enrollment.studentId);
          studentsByMotherClass.set(enrollment.classSection.motherClassId, students);
        }
      }

      // --- e. Loop, create ClassFees, and prepare FeesCollections ---
      let createdClassFeeCount = 0;
      const feesCollectionToCreate: Prisma.FeesCollectionCreateManyInput[] = [];

      for (const mcId of motherClassIdsToCreate) {
        const newClassFee = await tx.classFee.create({
          data: {
            globalFeesId: globalFeeId,
            motherClassId: mcId,
            dueDate: dueDate, // Use the copied due date
          },
        });
        createdClassFeeCount++;

        const studentIds = studentsByMotherClass.get(mcId);
        if (studentIds && studentIds.length > 0) {
          for (const studentId of studentIds) {
            feesCollectionToCreate.push({
              classFeeId: newClassFee.id,
              studentId: studentId,
              status: PaymentStatus.PENDING,
            });
          }
        }
      }

      // --- f. Bulk-create all FeesCollection records ---
      if (feesCollectionToCreate.length > 0) {
        await tx.feesCollection.createMany({
          data: feesCollectionToCreate,
        });
      }

      return {
        message: 'Fee successfully assigned to new classes.',
        createdClassFeeCount,
        createdFeesCollectionCount: feesCollectionToCreate.length,
      };
    });

    return NextResponse.json(result, {status: 201});

  } catch (error: any) {
    // --- 3. Robust Error Handling ---
    console.error('Error assigning global fee to classes:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if necessary
    }
    return NextResponse.json(
      {error: error.message || 'An internal server error occurred.'},
      {status: error.message.includes('not exist') || error.message.includes('No existing ClassFee') ? 404 : 500}
    );
  }
}*/

export async function POST(request: Request) {
  try {
    const body: AssignGlobalFeePayload = await request.json();
    const {globalFeeId, motherClassIds, institutionId} = body;

    // --- Validation (Unchanged and Correct) ---
    if (!globalFeeId || !Array.isArray(motherClassIds) || motherClassIds.length === 0 || !institutionId) {
      return NextResponse.json(
        {error: 'A globalFeeId and a non-empty motherClassIds array are required.'},
        {status: 400}
      );
    }

    // Additional validation can be added here as needed

    const result = await prisma.$transaction(async (tx) => {
      // Find the due date from a source ClassFee (Unchanged)
      const sourceClassFee = await tx.classFee.findFirst({
        where: {globalFeesId: globalFeeId},
        select: {dueDate: true},
      });

      if (!sourceClassFee) {
        throw new Error(
          'Cannot assign fee: No existing ClassFee found for this Global Fee to copy the due date from.'
        );
      }
      const dueDate = sourceClassFee.dueDate;

      // Validate MotherClasses (Unchanged)
      const existingMotherClassesCount = await tx.motherClass.count({
        where: {id: {in: motherClassIds}},
      });
      if (existingMotherClassesCount !== motherClassIds.length) {
        throw new Error('One or more of the provided motherClassIds do not exist.');
      }

      // Prevent creating duplicate links (Unchanged)
      const alreadyLinked = await tx.classFee.findMany({
        where: {globalFeesId: globalFeeId, motherClassId: {in: motherClassIds}},
        select: {motherClassId: true}
      });

      const alreadyLinkedIds = new Set(alreadyLinked.map(cf => cf.motherClassId));
      const motherClassIdsToCreate = motherClassIds.filter(id => !alreadyLinkedIds.has(id));

      if (motherClassIdsToCreate.length === 0) {
        return {
          message: "All provided classes are already linked to this fee.",
          createdClassFeeCount: 0,
          createdFeesCollectionCount: 0
        };
      }

      // Get all enrolled students for the classes to be linked (Unchanged)
      const studentEnrollments = await tx.studentClassEnrollment.findMany({
        where: {
          classSection: {motherClassId: {in: motherClassIdsToCreate}},
          enrollmentStatus: 'ENROLLED',
        },
        select: {
          studentId: true,
          classSection: {select: {motherClassId: true}},
        },
      });

      // FIX 1: Use a Set to automatically handle duplicate student enrollments
      const studentsByMotherClass = new Map<string, Set<string>>();
      for (const enrollment of studentEnrollments) {
        if (enrollment.classSection.motherClassId) {
          const students = studentsByMotherClass.get(enrollment.classSection.motherClassId) || new Set<string>();
          students.add(enrollment.studentId); // .add() ensures uniqueness
          studentsByMotherClass.set(enrollment.classSection.motherClassId, students);
        }
      }

      let createdClassFeeCount = 0;
      const feesCollectionToCreate: Prisma.FeesCollectionCreateManyInput[] = [];

      for (const mcId of motherClassIdsToCreate) {
        const newClassFee = await tx.classFee.create({
          data: {
            globalFeesId: globalFeeId,
            motherClassId: mcId,
            dueDate: dueDate,
          },
        });
        createdClassFeeCount++;

        const studentIdsSet = studentsByMotherClass.get(mcId);
        if (studentIdsSet && studentIdsSet.size > 0) {
          for (const studentId of studentIdsSet) { // Iterate over the Set
            feesCollectionToCreate.push({
              classFeeId: newClassFee.id,
              studentId: studentId,
              status: PaymentStatus.PENDING,
            });
          }
        }
      }

      if (feesCollectionToCreate.length > 0) {
        // FIX 2: Add skipDuplicates: true to the createMany call
        await tx.feesCollection.createMany({
          data: feesCollectionToCreate,
          skipDuplicates: true,
        });
      }

      return {
        message: 'Fee successfully assigned to new classes.',
        createdClassFeeCount,
        createdFeesCollectionCount: feesCollectionToCreate.length,
      };
    });

    return NextResponse.json(result, {status: 201});

  } catch (error: any) {
    // Error handling remains the same
    console.error('Error assigning global fee to classes:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({error: "A unique constraint was violated during the operation. This may be due to a race condition. Please try again."}, {status: 409});
      }
    }
    return NextResponse.json(
      {error: error.message || 'An internal server error occurred.'},
      {status: error.message.includes('not exist') || error.message.includes('No existing ClassFee') ? 404 : 500}
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

interface UnassignFeePayload {
  globalFeeId: string;
  motherClassIds: string[];
}

export async function DELETE(request: Request) {
  try {
    const body: UnassignFeePayload = await request.json();
    const { globalFeeId, motherClassIds } = body;

    if (!globalFeeId || !Array.isArray(motherClassIds) || motherClassIds.length === 0) {
      return NextResponse.json(
        {
          error: 'A globalFeeId and a non-empty motherClassIds array are required.',
        },
        { status: 400 }
      );
    }

    const deleteResult = await prisma.classFee.deleteMany({
      where: {
        globalFeesId: globalFeeId,
        motherClassId: {
          in: motherClassIds,
        },
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        {
          message: 'No matching class fee links were found to delete.',
          deletedCount: 0
        },
        { status: 200 } // 200 is appropriate as the request was valid, even if it did nothing.
      );
    }

    return NextResponse.json(
      {
        message: 'Class fee links deleted successfully.',
        deletedCount: deleteResult.count,
      },
      { status: 200 }
    );
  } catch (error: any) {

    console.error('Failed to delete class fee links:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
