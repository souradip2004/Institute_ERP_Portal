import {NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {PaymentStatus} from '@prisma/client';

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const institutionId = searchParams.get('institutionId');
    const isDeleted = searchParams.get('isDeleted');

    let deleted = false;
    if (isDeleted === 'true') {
      deleted = true
    }

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
          isDeleted: deleted,
          studentsLocalFees: {some: {studentId}},
        },
      },
      include: {
        localFees: {
          include: {
            studentsLocalFees: {
              where: {studentId},
              select: {
                offsetFee: true,
              }
            }
          }
        },
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

    console.log("Fee Details: ", feeDetails);

    const now = new Date();
    const feeCollectionsToUpdate: string[] = [];
    const feesCollectionToVerify: string[] = [];

    // --- 3. Process the data and prepare the response ---
    const structuredResponse = feeDetails.map(detail => {
      const collectionDetails = detail.feesCollections[0];
      const localFee = detail.localFees!;
      console.log("Fee collection details: ", detail.feesCollections, "classFeeId ", detail.id);
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

      let currentStatus = collectionDetails.status;
      let isPenaltyApplied = collectionDetails.penaltyApplied && currentStatus === PaymentStatus.OVERDUE;

      if ((currentStatus === PaymentStatus.PENDING || currentStatus === PaymentStatus.PARTIAL) && detail.dueDate < now) {
        currentStatus = PaymentStatus.OVERDUE;
        if (!feeCollectionsToUpdate.includes(collectionDetails.id)) {
          feeCollectionsToUpdate.push(collectionDetails.id);
        }
      }

      const offsetFee = localFee.studentsLocalFees[0].offsetFee;
      // console.log("Offset fee: ", offsetFee);
      const penaltyToAdd = isPenaltyApplied ? localFee.penalty : 0;
      const baseAmount = localFee.amount;
      const taxAmount = (baseAmount * localFee.taxPercentage) / 100;
      const scholarshipAmount = collectionDetails.scholarshipAmt || 0;

      let totalBillable = (baseAmount - scholarshipAmount) + taxAmount + penaltyToAdd - offsetFee;
      if (baseAmount - scholarshipAmount <= 0) {
        totalBillable = 0;
        feesCollectionToVerify.push(collectionDetails.id);
      }

      const amountPaid = collectionDetails.paymentTransactions
      .filter(transaction => transaction.verified)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

      const amountDue = Math.max(0.0, parseFloat((totalBillable - amountPaid).toFixed(2)));

      return {
        localFeesId: localFee.id,
        name: localFee.name,
        description: localFee.description,
        amountDue: baseAmount - scholarshipAmount <= 0 ? 0 : amountDue,
        baseAmount,
        totalBillable,
        taxPercentageIncluded: localFee.taxPercentage,
        penaltyIncluded: localFee.penalty,
        isPenaltyApplied,
        paymentTerms: localFee.paymentterms,
        dueDate: detail.dueDate,
        classFeeId: detail.id,
        paymentStatus: currentStatus || (baseAmount - scholarshipAmount <= 0 && 'PAID'),
        amountPaid: parseFloat(amountPaid.toFixed(2)) || (baseAmount - scholarshipAmount),
        scholarshipAmount: parseFloat(scholarshipAmount.toFixed(2)),
        isVerified: collectionDetails.paymentTransactions.every(t => t.verified) || (baseAmount - scholarshipAmount <= 0),
        feesCollectionId: collectionDetails.id,
        paymentTransactions: collectionDetails.paymentTransactions.map(t => ({
          id: t.id,
          amount: t.amount,
          paymentDate: t.paymentDate,
          paymentMethod: t.paymentMethod,
          transactionIdSubmitted: t.transactionId,
          verified: t.verified
        })),

      };
    });

    // --- 7. Perform Database Update (Fire-and-forget) ---
    if (feeCollectionsToUpdate.length > 0) {
      await prisma.feesCollection.updateMany({
        where: {id: {in: feeCollectionsToUpdate}},
        data: {
          status: PaymentStatus.OVERDUE
        }
      });
    }

    if (feesCollectionToVerify.length > 0) {
      await prisma.feesCollection.updateMany({
        where: {id: {in: feesCollectionToVerify}},
        data: {
          verified: true,
          status: PaymentStatus.PAID
        }
      });
    }

    return NextResponse.json(structuredResponse, {status: 200});

  } catch (error) {
    console.error("Error fetching student local fee details: ", error);
    return NextResponse.json({error: "An internal server error occurred."}, {status: 500});
  }
}