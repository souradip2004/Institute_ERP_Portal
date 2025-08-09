import {NextResponse} from 'next/server';
import {PrismaClient, PaymentStatus} from '@prisma/client';

const prisma = new PrismaClient();

interface FeePaymentPayload {
  studentId: string;
  classFeeId: string;
  amountPaid: number;
  paymentMethod: string;
  transactionId?: string;
  feesCollectionId: string;
}

export async function PATCH(request: Request) {
  try {
    const body: FeePaymentPayload = await request.json();
    const {
      studentId,
      classFeeId,
      amountPaid,
      paymentMethod,
      transactionId,
      feesCollectionId
    } = body;

    if (!studentId || !classFeeId || !paymentMethod || !feesCollectionId || !amountPaid) {
      return NextResponse.json({error: "Missing required fields in request body."}, {status: 400});
    }

    if (amountPaid <= 0) {
      return NextResponse.json({error: "Payment amount must be positive."}, {status: 400});
    }

    const updatedFeeCollection = await prisma.$transaction(async (tx) => {

      const classFee = await tx.classFee.findUnique({
        where: {id: classFeeId},
        select: {
          id: true,
          dueDate: true,
          globalFees: {
            select: {
              amount: true,
              taxPercentage: true,
              penalty: true
            }
          },
          localFees: {
            select:
              {
                amount: true,
                taxPercentage: true,
                penalty: true
              }
          },
        }
      });

      if (!classFee) {
        throw new Error("ClassFee not found.");
      }

      const feeCollection = await tx.feesCollection.findUnique({
        where: {id: feesCollectionId, studentId: studentId}
      });

      if (!feeCollection) {
        throw new Error("No pending fee found for this student and fee collection ID.");
      }

      if (!classFee.globalFees && !classFee.localFees) {
        throw new Error("Fee details (Global/Local) not found for this ClassFee. Please contact the administrator.");
      }

      const now = new Date();
      const dueDate = classFee.dueDate;
      const isPenaltyApplied = dueDate < now && feeCollection.status !== PaymentStatus.PAID;

      const baseAmount = classFee.globalFees?.amount ?? classFee.localFees?.amount ?? 0;
      const taxPercentage = classFee.globalFees?.taxPercentage ?? classFee.localFees?.taxPercentage ?? 0;
      const penalty = isPenaltyApplied ? classFee.globalFees?.penalty ?? classFee.localFees?.penalty ?? 0 : 0;
      const totalAmountDue = baseAmount + (baseAmount * taxPercentage / 100) + penalty - feeCollection.amount;

      if (totalAmountDue <= 0 || !dueDate) {
        throw new Error("Fee details (amount or due date) could not be determined from the linked fee.");
      }

      // const currentAmountPaid = feeCollection.amount;
      const newTotalPaid = amountPaid;
      console.log("Total payment ", newTotalPaid);
      console.log("Total amount due ", totalAmountDue);
      if (newTotalPaid > totalAmountDue) {
        throw new Error(`Overpayment detected. Amount due: ${totalAmountDue}, current amount paid: ${amountPaid}`);
      }

      let newStatus: PaymentStatus;
      const paymentTransactionDate = new Date();

      if (newTotalPaid === totalAmountDue) {
        newStatus = PaymentStatus.PAID;
      } else if (paymentTransactionDate > dueDate) {
        // If it's not fully paid and the payment date is after the due date, it's OVERDUE
        newStatus = PaymentStatus.OVERDUE;
      } else {
        newStatus = PaymentStatus.PARTIAL;
      }

      const updatedRecord = await tx.feesCollection.update({
        where: {
          id: feeCollection.id
        },
        data: {
          amount: newTotalPaid + feeCollection.amount,
          status: newStatus,
          penaltyApplied: isPenaltyApplied,
          paymentDate: paymentTransactionDate,
          paymentMethod: paymentMethod,
          transactionId: transactionId
        }
      });

      return updatedRecord;
    });

    return NextResponse.json(updatedFeeCollection, {status: 200});

  } catch (error: any) {
    console.error("Error processing fee payment: ", error);
    // Provide specific error messages back to the client
    if (error.message.includes("Overpayment detected") ||
      error.message.includes("not found") ||
      error.message.includes("could not be determined")) {
      return NextResponse.json({error: error.message}, {status: 400}); // Bad Request
    }

    return NextResponse.json({error: "An internal server error occurred."}, {status: 500});
  }
}