import {NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {PaymentStatus} from '@prisma/client';

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const institutionId = searchParams.get('institutionId');
    const isDeleted: boolean = (searchParams.get('isDeleted') || false) as boolean;

    if (!studentId || !institutionId) {
      return NextResponse.json({
        error: "Missing required parameters. 'studentId' and 'institutionId' are required."
      }, {status: 400});
    }

    // --- 1. Validate Student and get their active classes ---
    const student = await prisma.student.findFirst({
      where: {id: studentId, department: {institutionId: institutionId}},
      select: {id: true}
    });

    if (!student) {
      return NextResponse.json({error: "Student not found in the specified institution."}, {status: 404});
    }

    const enrollments = await prisma.studentClassEnrollment.findMany({
      where: {studentId: studentId, enrollmentStatus: 'ENROLLED', classSection: {motherClassId: {not: null}}},
      select: {classSection: {select: {motherClassId: true}}}
    });

    const studentMotherClassIds = enrollments
    .map(e => e.classSection.motherClassId)
    .filter((id): id is string => id !== null);

    if (studentMotherClassIds.length === 0) {
      return NextResponse.json([], {status: 200}); // No classes, so no fees
    }

    // --- 2. Fetch all relevant Local Fee data in one go ---
    const feeDetails = await prisma.classFee.findMany({
      where: {
        motherClassId: {in: studentMotherClassIds},
        localFeesId: {not: null},
        // Ensure we only fetch fees specifically assigned to this student
        localFees: {
          isDeleted,
          studentsLocalFees: {some: {studentId}},
        },
      },
      include: {
        localFees: true, // Includes details like name, penalty, tax
        feesCollections: {
          where: {studentId},
          include: {
            paymentTransactions: {
              orderBy: {
                paymentDate: 'desc'
              }
            }
          }
        }
      },
    });

    const now = new Date();
    const feeCollectionsToUpdate: string[] = [];

    // --- 3. Process the data and prepare the response ---
    const structuredResponse = feeDetails.map(detail => {
      const collectionDetails = detail.feesCollections[0];
      const localFee = detail.localFees!;

      // Handle cases where a fee is assigned but not yet generated in feesCollections
      if (!collectionDetails) {
        const baseAmount = localFee.amount;
        const taxAmount = (baseAmount * localFee.taxPercentage) / 100;
        const totalBillable = baseAmount + taxAmount;
        return {
          localFeesId: localFee.id,
          name: localFee.name,
          description: localFee.description,
          amountDue: parseFloat(totalBillable.toFixed(2)),
          baseAmount,
          totalBillable,
          taxPercentageIncluded: localFee.taxPercentage,
          penaltyIncluded: localFee.penalty,
          isPenaltyApplied: false,
          paymentTerms: localFee.paymentterms,
          dueDate: detail.dueDate,
          classFeeId: detail.id,
          paymentStatus: 'NOT_GENERATED',
          amountPaid: 0,
          isVerified: false,
          scholarshipAmount: 0,
          feesCollectionId: null,
          paymentTransactions: []
        };
      }

      // --- 4. Dynamic Status and Penalty Calculation ---
      let currentStatus = collectionDetails.status;
      let isPenaltyApplied = collectionDetails.penaltyApplied;

      if ((currentStatus === PaymentStatus.PENDING || currentStatus === PaymentStatus.PARTIAL) && detail.dueDate < now) {
        currentStatus = PaymentStatus.OVERDUE;
        isPenaltyApplied = true;
        if (!feeCollectionsToUpdate.includes(collectionDetails.id)) {
          feeCollectionsToUpdate.push(collectionDetails.id);
        }
      }

      const penaltyToAdd = isPenaltyApplied ? localFee.penalty : 0;
      const baseAmount = localFee.amount;
      const taxAmount = (baseAmount * localFee.taxPercentage) / 100;
      const totalBillable = baseAmount + taxAmount + penaltyToAdd;

      // --- 5. Calculate Final Amount Due with scholarship and verified payments ---
      const scholarshipAmount = collectionDetails.scholarshipAmt || 0;

      const amountPaid = collectionDetails.paymentTransactions
      .filter(transaction => transaction.verified)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

      const amountDue = Math.max(0.0, parseFloat((totalBillable - scholarshipAmount - amountPaid).toFixed(2)));

      // --- 6. Construct the final object for the response ---
      return {
        localFeesId: localFee.id,
        name: localFee.name,
        description: localFee.description,
        amountDue,
        baseAmount,
        totalBillable,
        taxPercentageIncluded: localFee.taxPercentage,
        penaltyIncluded: localFee.penalty,
        isPenaltyApplied,
        paymentTerms: localFee.paymentterms,
        dueDate: detail.dueDate,
        classFeeId: detail.id,
        paymentStatus: currentStatus,
        amountPaid: parseFloat(amountPaid.toFixed(2)),
        scholarshipAmount: parseFloat(scholarshipAmount.toFixed(2)),
        isVerified: collectionDetails.paymentTransactions.every(t => t.verified),
        feesCollectionId: collectionDetails.id,
        paymentTransactions: collectionDetails.paymentTransactions.map(t => ({
          id: t.id,
          amount: t.amount,
          paymentDate: t.paymentDate,
          paymentMethod: t.paymentMethod,
          transactionId: t.transactionId,
          verified: t.verified
        })),
      };
    });

    // --- 7. Perform Database Update (Fire-and-forget) ---
    if (feeCollectionsToUpdate.length > 0) {
      await prisma.feesCollection.updateMany({
        where: {id: {in: feeCollectionsToUpdate}},
        data: {
          status: PaymentStatus.OVERDUE,
          penaltyApplied: true
        }
      });
    }

    return NextResponse.json(structuredResponse, {status: 200});

  } catch (error) {
    console.error("Error fetching student local fee details: ", error);
    return NextResponse.json({error: "An internal server error occurred."}, {status: 500});
  }
}