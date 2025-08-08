import {NextResponse} from 'next/server';
import {PrismaClient, Prisma, PaymentStatus, PaymentTerms} from '@prisma/client';
import {calculateDueDates} from "@/app/api/payment/global-fees/route";

const prisma = new PrismaClient();

interface AssignGlobalFeePayload {
  globalFeeId: string;
  motherClassIds: string[];
  institutionId: string;
}

export async function POST(request: Request) {
  try {
    const body: AssignGlobalFeePayload = await request.json();
    const {globalFeeId, motherClassIds, institutionId} = body;

    // --- Validation (Unchanged) ---
    if (!globalFeeId || !Array.isArray(motherClassIds) || motherClassIds.length === 0 || !institutionId) {
      return NextResponse.json(
        {error: 'A globalFeeId and a non-empty motherClassIds array are required.'},
        {status: 400}
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // --- 1. Fetch the existing GlobalFee's details ---
      const globalFee = await tx.globalFees.findUnique({
        where: { id: globalFeeId, institutionId: institutionId },
        select: { paymentterms: true }
      });

      if (!globalFee) {
        throw new Error(`Global Fee with ID ${globalFeeId} not found in this institution.`);
      }

      // --- 2. Handle ONE_TIME fees by finding a template due date ---
      let oneTimeDueDate: string | undefined = undefined;
      if (globalFee.paymentterms === 'ONE_TIME') {
        const sourceClassFee = await tx.classFee.findFirst({
          where: { globalFeesId: globalFeeId },
          select: { dueDate: true }
        });
        if (!sourceClassFee) {
          throw new Error('Cannot assign ONE_TIME fee: No existing ClassFee found to copy the due date from.');
        }
        oneTimeDueDate = sourceClassFee.dueDate.toISOString();
      }

      // --- 3. Validate MotherClasses and check for existing links (Idempotency) ---
      const motherClassIdsSet = new Set(motherClassIds);
      const existingMotherClassesCount = await tx.motherClass.count({
        where: { id: { in: motherClassIds } },
      });
      if (existingMotherClassesCount !== motherClassIdsSet.size) {
        throw new Error('One or more of the provided motherClassIds do not exist.');
      }

      const alreadyLinked = await tx.classFee.findMany({
        where: { globalFeesId: globalFeeId, motherClassId: { in: motherClassIds } },
        select: { motherClassId: true }
      });
      const alreadyLinkedIds = new Set(alreadyLinked.map(cf => cf.motherClassId));
      const motherClassIdsToCreate = motherClassIds.filter(id => !alreadyLinkedIds.has(id));

      if (motherClassIdsToCreate.length === 0) {
        return { message: "All provided classes are already linked to this fee.", createdClassFeeCount: 0 };
      }

      // --- 4. Pre-fetch all relevant student data ---
      const studentEnrollments = await tx.studentClassEnrollment.findMany({
        where: {
          classSection: { motherClassId: { in: motherClassIdsToCreate } },
          enrollmentStatus: 'ENROLLED',
        },
        select: { studentId: true, classSection: { select: { motherClassId: true } } },
      });

      const studentsByMotherClass = new Map<string, Set<string>>();
      for (const enrollment of studentEnrollments) {
        if (enrollment.classSection.motherClassId) {
          const students = studentsByMotherClass.get(enrollment.classSection.motherClassId) || new Set();
          students.add(enrollment.studentId);
          studentsByMotherClass.set(enrollment.classSection.motherClassId, students);
        }
      }

      const allFeesCollectionToCreate: Prisma.FeesCollectionCreateManyInput[] = [];
      let totalClassFeesCreated = 0;

      for (const mcId of motherClassIdsToCreate) {
        const section = await tx.classSection.findFirst({
          where: { motherClassId: mcId },
          select: { semester: { select: { startDate: true, endDate: true } } }
        });

        if (!section?.semester) {
          console.warn(`Skipping MotherClass ID: ${mcId} as it has no linked semester.`);
          continue;
        }

        const dueDates = calculateDueDates(section.semester.startDate, section.semester.endDate, globalFee.paymentterms, oneTimeDueDate);

        for (const dueDate of dueDates) {
          const newClassFee = await tx.classFee.create({
            data: {
              globalFeesId: globalFeeId,
              motherClassId: mcId,
              dueDate: dueDate,
            },
          });
          totalClassFeesCreated++;

          const studentIds = studentsByMotherClass.get(mcId);
          if (studentIds) {
            for (const studentId of studentIds) {
              allFeesCollectionToCreate.push({
                classFeeId: newClassFee.id,
                studentId: studentId,
                status: PaymentStatus.PENDING,
              });
            }
          }
        }
      }

      if (allFeesCollectionToCreate.length > 0) {
        await tx.feesCollection.createMany({
          data: allFeesCollectionToCreate,
          skipDuplicates: true,
        });
      }

      return {
        message: 'Fee successfully assigned to new classes.',
        createdClassFeeCount: totalClassFeesCreated,
        createdFeesCollectionCount: allFeesCollectionToCreate.length,
      };
    });

    return NextResponse.json(result, {status: 201});

  } catch (error: any) {
    console.error('Error assigning global fee to classes:', error);
    return NextResponse.json(
      {error: error.message || 'An internal server error occurred.'},
      {status: error.message.includes('not found') || error.message.includes('not exist') ? 404 : 500}
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
  }
}
