import {NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {PaymentStatus} from '@prisma/client';

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    const studentId = searchParams.get('studentId');
    const motherClassId = searchParams.get('motherClassId');

    if (!institutionId || !studentId || !motherClassId) {
      return NextResponse.json({
        error: "Missing required parameters. 'institutionId', 'studentId', and 'motherClassId' are required."
      }, {status: 400});
    }

    const feeDetails = await prisma.classFee.findMany({
      where: {
        motherClassId: motherClassId,
        globalFeesId: {not: null},
        globalFees: {institutionId: institutionId},
      },
      include: {
        globalFees: true,
        feesCollections: {
          where: {studentId: studentId},
        }
      }
    });

    const now = new Date();

    const updatedFeeDetails = async (id: string) => {
      return prisma.feesCollection.update({
        where: {id},
        data: {
          status: PaymentStatus.OVERDUE,
          penaltyApplied: true
        }
      })
    }

    const structuredResponse = await Promise.all(feeDetails
    .map(detail => {
      const collectionDetails = detail.feesCollections[0];
      const globalFee = detail.globalFees!;

      let adminPenaltyApplied: boolean;
      if ((collectionDetails.status === PaymentStatus.PENDING || collectionDetails.status === PaymentStatus.PARTIAL) && detail.dueDate < now) {
        updatedFeeDetails(collectionDetails.id);
        adminPenaltyApplied = true;
      } else {
        adminPenaltyApplied = collectionDetails.penaltyApplied;
      }

      // console.log("Fee collection details: ", detail.feesCollections);
      const penaltyToAdd = (adminPenaltyApplied) ? globalFee.penalty : 0;

      const baseAmount = globalFee.amount;

      const taxAmount = (baseAmount * globalFee.taxPercentage) / 100;
      const totalBillable = baseAmount + taxAmount + penaltyToAdd;
      console.log("Total billable ", totalBillable);
      const amountPaid = collectionDetails?.amount || 0;
      console.log("Amount paid ", amountPaid);
      const amountDue = parseFloat((totalBillable - amountPaid).toFixed(2));


      return {
        feeId: globalFee.id,
        name: globalFee.name,
        description: globalFee.description,
        amountDue,
        baseAmount: totalBillable,
        taxPercentageIncluded: globalFee.taxPercentage,
        penaltyIncluded: globalFee.penalty,
        isPenaltyApplied: adminPenaltyApplied,
        paymentTerms: globalFee.paymentterms,
        dueDate: detail.dueDate,
        classFeeId: detail.id,
        paymentStatus: collectionDetails?.status || 'NOT_GENERATED',
        amountPaid: amountPaid,
        isVerified: collectionDetails?.verified,
        paymentDate: collectionDetails?.paymentDate,
        paymentMethod: collectionDetails?.paymentMethod,
        transactionId: collectionDetails?.transactionId,
        feesCollectionId: collectionDetails?.id || null,
      };
    }));

    return NextResponse.json(structuredResponse, {status: 200});

  } catch (error) {
    console.error("Error fetching student global fee details: ", error);
    return NextResponse.json({error: "An internal server error occurred."}, {status: 500});
  }
}