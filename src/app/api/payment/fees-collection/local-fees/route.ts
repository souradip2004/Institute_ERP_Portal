import {NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {PaymentStatus, Student} from '@prisma/client'; // Assuming Student model might be needed for validation

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const institutionId = searchParams.get('institutionId');

    // 1. Validation (Unchanged)
    if (!studentId || !institutionId) {
      return NextResponse.json({
        error: "Missing required parameters. 'studentId' and 'institutionId' are required."
      }, {status: 400});
    }

    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
        department: {
          institutionId: institutionId
        }
      },
      select: {id: true}
    });

    if (!student) {
      return NextResponse.json({
        error: "Student not found in the specified institution."
      }, {status: 404});
    }

    // 2. Find all MotherClass IDs for the student's active enrollments (Unchanged)
    const enrollments = await prisma.studentClassEnrollment.findMany({
      where: {
        studentId: studentId,
        enrollmentStatus: 'ENROLLED',
        classSection: {
          motherClassId: {not: null}
        }
      },
      select: {
        classSection: {select: {motherClassId: true}}
      }
    });

    const studentMotherClassIds = enrollments
    .map(e => e.classSection.motherClassId)
    .filter((id): id is string => id !== null);

    if (studentMotherClassIds.length === 0) {
      return NextResponse.json([], {status: 200});
    }

    const feeDetails = await prisma.classFee.findMany({
      where: {
        motherClassId: {in: studentMotherClassIds},
        localFeesId: {not: null},
        localFees: {
          studentsLocalFees: {some: {studentId: studentId}},
        },
      },
      include: {
        localFees: true,
        feesCollections: {
          where: {studentId: studentId}
        }
      },
    });

    const now = new Date();

    const structuredResponse = feeDetails
    .filter(detail => detail.localFees) // Ensure localFees object exists
    .map(detail => {
      const collectionDetails = detail.feesCollections[0] || null;
      const localFee = detail.localFees!;


      const isPenaltyApplied = detail.dueDate < now && collectionDetails?.status !== PaymentStatus.PAID;

      const penaltyToAdd = isPenaltyApplied ? localFee.penalty : 0;

      const baseAmount = localFee.amount;
      const taxAmount = (baseAmount * localFee.taxPercentage) / 100;
      const totalBillable = baseAmount + taxAmount + penaltyToAdd;
      const amountPaid = collectionDetails?.amount || 0;
      const amountDue = parseFloat((totalBillable - amountPaid).toFixed(2));

      return {
        localFeesId: localFee.id,
        name: localFee.name,
        description: localFee.description,
        amountDue,
        baseAmount: totalBillable,
        taxPercentageIncluded: localFee.taxPercentage,
        penaltyIncluded: localFee.penalty,
        isPenaltyApplied, // The new boolean field
        paymentTerms: localFee.paymentterms,
        dueDate: detail.dueDate, // Good to return the due date for context
        classFeeId: detail.id,
        paymentStatus: collectionDetails?.status || 'NOT_GENERATED',
        amountPaid: amountPaid,
        paymentDate: collectionDetails?.paymentDate,
        paymentMethod: collectionDetails?.paymentMethod,
        transactionId: collectionDetails?.transactionId,
        feesCollectionId: collectionDetails?.id || null,
      };
    });

    return NextResponse.json(structuredResponse, {status: 200});

  } catch (error) {
    console.error("Error fetching student local fee details: ", error);
    return NextResponse.json({error: "An internal server error occurred."}, {status: 500});
  }
}