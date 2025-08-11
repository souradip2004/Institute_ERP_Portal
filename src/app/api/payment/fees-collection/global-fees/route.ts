import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {PaymentStatus} from "@prisma/client";

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    const studentId = searchParams.get('studentId');
    const motherClassId = searchParams.get('motherClassId');
    const isDeleted: boolean = (searchParams.get('isDeleted') || false) as boolean;

    if (!institutionId || !studentId || !motherClassId) {
      return NextResponse.json({
        error: "Missing required parameters. 'institutionId', 'studentId', and 'motherClassId' are required."
      }, {status: 400});
    }

    // --- 1. Fetch all relevant data in one go ---
    const feeDetails = await prisma.classFee.findMany({
      where: {
        motherClassId: motherClassId,
        globalFeesId: {not: null},
        globalFees: {institutionId: institutionId, isDeleted},
      },
      include: {
        globalFees: true,
        feesCollections: {
          where: {studentId: studentId},
          include: {
            paymentTransactions: {
              orderBy: {
                paymentDate: 'desc'
              }
            }
          }
        }
      }
    });

    const now = new Date();
    const feeCollectionsToUpdate: string[] = [];

    const structuredResponse = feeDetails.map(detail => {
      const collectionDetails = detail.feesCollections[0];
      const globalFee = detail.globalFees!;

      if (!collectionDetails) {
        const baseAmount = globalFee.amount;
        const taxAmount = (baseAmount * globalFee.taxPercentage) / 100;
        const totalBillable = baseAmount + taxAmount;
        return {
          feeId: globalFee.id,
          name: globalFee.name,
          description: globalFee.description,
          amountDue: parseFloat(totalBillable.toFixed(2)),
          baseAmount,
          totalBillable,
          taxPercentageIncluded: globalFee.taxPercentage,
          penaltyIncluded: globalFee.penalty,
          isPenaltyApplied: false,
          paymentTerms: globalFee.paymentterms,
          dueDate: detail.dueDate,
          classFeeId: detail.id,
          paymentStatus: 'NOT_GENERATED',
          amountPaid: 0,
          isVerified: false,
          scholarshipAmount: 0, // No scholarship if not generated
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

      const penaltyToAdd = isPenaltyApplied ? globalFee.penalty : 0;
      const baseAmount = globalFee.amount;
      const taxAmount = (baseAmount * globalFee.taxPercentage) / 100;
      const totalBillable = baseAmount + taxAmount + penaltyToAdd;

      const scholarshipAmount = collectionDetails.scholarshipAmt || 0;

      const amountPaid = collectionDetails.paymentTransactions
      .filter(transaction => transaction.verified)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

      const amountDue = Math.max(0.0, parseFloat((totalBillable - scholarshipAmount - amountPaid).toFixed(2)));

      return {
        feeId: globalFee.id,
        name: globalFee.name,
        description: globalFee.description,
        amountDue,
        baseAmount,
        totalBillable,
        taxPercentageIncluded: globalFee.taxPercentage,
        penaltyIncluded: globalFee.penalty,
        isPenaltyApplied: isPenaltyApplied,
        paymentTerms: globalFee.paymentterms,
        dueDate: detail.dueDate,
        classFeeId: detail.id,
        paymentStatus: currentStatus,
        amountPaid: parseFloat(amountPaid.toFixed(2)),
        scholarshipAmount: parseFloat(scholarshipAmount.toFixed(2)), // Include scholarship in the response
        isVerified: collectionDetails.paymentTransactions.every(t => t.verified),
        feesCollectionId: collectionDetails.id,
        paymentTransactions: collectionDetails.paymentTransactions.map(t => ({
          id: t.id,
          amount: t.amount,
          paymentDate: t.paymentDate,
          paymentMethod: t.paymentMethod,
          transactionId: t.transactionId,
          verified: t.verified
        }))
      };
    });

    console.log("Fees collection to update ", feeCollectionsToUpdate)
    if (feeCollectionsToUpdate.length > 0) {
      await prisma.feesCollection.updateMany({
        where: {id: {in: feeCollectionsToUpdate}},
        data: {
          status: PaymentStatus.OVERDUE
        }
      });
    }

    return NextResponse.json(structuredResponse, {status: 200});

  } catch (error) {
    console.error("Error fetching student global fee details: ", error);
    return NextResponse.json({error: "An internal server error occurred."}, {status: 500});
  }
}