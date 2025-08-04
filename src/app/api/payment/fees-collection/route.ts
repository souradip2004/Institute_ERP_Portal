import {NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {FeesCollection, PaymentStatus} from '@prisma/client';

// Define the structure of the incoming request body.
interface FeePaymentPayload {
  studentId: string;
  classFeeId: string; // The ID of the specific fee being paid
  amountPaid: number;
  paymentMethod: string;
  paymentDate: string; // The date the payment is being made (e.g., "2025-08-21")
  transactionId?: string;
}

export async function PATCH(request: Request) {
  const body: FeePaymentPayload = await request.json();
  const {
    studentId,
    classFeeId,
    amountPaid,
    paymentMethod,
    paymentDate,
    transactionId
  } = body;

  // 1. Basic Validation
  if (!studentId || !classFeeId || !paymentMethod || !paymentDate || amountPaid == null) {
    return NextResponse.json({error: "Missing required fields in request body."}, {status: 400});
  }

  if (amountPaid <= 0) {
    return NextResponse.json({error: "Payment amount must be positive."}, {status: 400});
  }

  try {
    const updatedFeeCollection = await prisma.$transaction(async (tx) => {
      // 2. Find the ClassFee and its parent to get total amount and due date
      const classFee = await tx.classFee.findUnique({
        where: {id: classFeeId},
        include: {
          globalFees: {select: {amount: true}}, // Assumes dueDate exists
          localFees: {select: {amount: true}},  // Assumes dueDate exists
          feesCollections: {
            where: {studentId},
            select: {amount: true, paymentDate: true, status: true, transactionId: true},
          }
        }
      });

      if (!classFee) {
        throw new Error("ClassFee not found.");
      }

      // Determine the total due and the due date from the parent fee
      const totalAmountDue = classFee.globalFees?.amount || classFee.localFees?.amount;
      const dueDate = classFee.globalFees?.dueDate || classFee.localFees?.dueDate;

      if (totalAmountDue == null || !dueDate) {
        throw new Error("Fee details (amount or due date) could not be determined.");
      }

      // 3. Find the specific FeesCollection record for this student and fee
      const feeCollection = await tx.feesCollection.findUnique({
        where: {
          classFeeId_studentId: {
            classFeeId: classFeeId,
            studentId: studentId
          }
        }
      });

      if (!feeCollection) {
        throw new Error("No pending fee found for this student and class fee.");
      }

      // 4. Validate against overpayment
      const currentAmountPaid = feeCollection.amount; // This stores the sum of previous payments
      const newTotalPaid = currentAmountPaid + amountPaid;

      if (newTotalPaid > totalAmountDue) {
        throw new Error(`Overpayment detected. Amount due: ${totalAmountDue}, current amount paid: ${currentAmountPaid}, attempted payment: ${amountPaid}.`);
      }

      // 5. Determine the new payment status based on your rules
      let newStatus: PaymentStatus;
      const paymentTransactionDate = new Date(paymentDate);

      // Rule: If payment is made after the due date, it's OVERDUE. This has the highest priority.
      if (paymentTransactionDate > dueDate) {
        newStatus = PaymentStatus.OVERDUE;
      }
      // Rule: If the new total paid equals the amount due (and it's on time)
      else if (newTotalPaid === totalAmountDue) {
        newStatus = PaymentStatus.PAID;
      }
      // Rule: If the payment is partial (and on time)
      else {
        newStatus = PaymentStatus.PARTIAL;
      }

      // 6. Update the FeesCollection record
      const updatedRecord = await tx.feesCollection.update({
        where: {
          id: feeCollection.id
        },
        data: {
          amount: newTotalPaid, // Update with the new cumulative amount
          status: newStatus,
          paymentDate: paymentTransactionDate, // Record the date of this specific payment
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