import {PrismaClient, PaymentStatus} from '@prisma/client';
import {NextResponse} from "next/server";

const prisma = new PrismaClient();

interface FeePaymentPayload {
  studentId: string;
  amountPaid: number;
  paymentMethod?: string;
  transactionId?: string;
  isCashPayment?: boolean;
}

export async function PATCH(request: Request) {
  try {
    const body: FeePaymentPayload = await request.json();
    const {
      studentId,
      amountPaid,
      paymentMethod,
      transactionId,
      isCashPayment = false,
    } = body;

    // --- 1. Initial Validations ---
    if (!studentId || !amountPaid) {
      return NextResponse.json({error: "studentId and amountPaid are required."}, {status: 400});
    }
    if (transactionId && isCashPayment) {
      return NextResponse.json({error: "transactionId cannot be provided for a cash payment."}, {status: 400});
    }
    if (amountPaid <= 0) {
      return NextResponse.json({error: "Payment amount must be positive."}, {status: 400});
    }
    if (!isCashPayment && !paymentMethod) {
      return NextResponse.json({error: "paymentMethod is required for non-cash payments."}, {status: 400});
    }

    const finalPaymentMethod = isCashPayment ? "Cash" : paymentMethod;

    const result = await prisma.$transaction(async (tx) => {
      // --- 2. Fetch all outstanding fees to calculate total debt ---
      const outstandingFees = await tx.feesCollection.findMany({
        where: {
          studentId: studentId,
          status: {not: PaymentStatus.PAID}
        },
        include: {
          classFee: {
            select: {
              dueDate: true,
              globalFees: {
                select: {
                  amount: true,
                  taxPercentage: true,
                  penalty: true
                }
              },
              localFees: {
                select: {
                  amount: true,
                  taxPercentage: true,
                  penalty: true,
                  studentsLocalFees: {
                    where: {
                      studentId
                    },
                    select: {
                      offsetFee: true,
                    }
                  }
                },
              },
            }
          },
          // IMPORTANT: We need the verification status to calculate the true balance
          paymentTransactions: {
            select: {
              amount: true,
              verified: true
            }
          }
        },
        orderBy: {
          classFee: {dueDate: 'asc'}
        }
      });

      if (outstandingFees.length === 0) {
        throw new Error("No pending fees found for this student.");
      }

      // --- 3. Calculate Total Outstanding Balance ---
      let totalOutstandingBalance = 0;
      for (const feeCollection of outstandingFees) {
        const baseFee = feeCollection.classFee.globalFees ?? feeCollection.classFee.localFees;

        let offset = 0;
        if (feeCollection.classFee.localFees) {
          offset = feeCollection.classFee.localFees.studentsLocalFees[0].offsetFee ?? 0;
        }
        if (!baseFee || !feeCollection.classFee.dueDate) {
          continue;
        }

        const isOverdue = feeCollection.status === PaymentStatus.OVERDUE && feeCollection.penaltyApplied;
        const penalty = isOverdue ? baseFee.penalty : 0;
        const totalFeeAmount = baseFee.amount + (baseFee.amount * baseFee.taxPercentage / 100) + penalty - offset;

        const alreadyPaidVerified = feeCollection.paymentTransactions
        .filter(t => t.verified)
        .reduce((sum, t) => sum + t.amount, 0);

        const scholarship = feeCollection.scholarshipAmt;
        const amountStillDue = totalFeeAmount - alreadyPaidVerified - scholarship;

        if (amountStillDue > 0) {
          totalOutstandingBalance += amountStillDue;
        }
      }

      totalOutstandingBalance = parseFloat(totalOutstandingBalance.toFixed(2));

      if (amountPaid > totalOutstandingBalance) {
        throw new Error(`Overpayment not allowed. Total amount due is ${totalOutstandingBalance.toFixed(2)}, but a payment of ${amountPaid} was provided.`);
      }

      // --- 5. Apply payment across fees (logic remains the same) ---
      let remainingAmountToApply = amountPaid;
      const createdTransactions = [];
      const paymentDate = new Date();

      for (const feeCollection of outstandingFees) {
        if (remainingAmountToApply <= 0) break;

        const baseFee = feeCollection.classFee.globalFees ?? feeCollection.classFee.localFees;
        if (!baseFee) continue;
        let offset = 0;
        if (feeCollection.classFee.localFees) {
          offset = feeCollection.classFee.localFees.studentsLocalFees[0].offsetFee ?? 0;
        }

        const isOverdue = feeCollection.status === PaymentStatus.OVERDUE && feeCollection.penaltyApplied;
        const penalty = isOverdue ? baseFee.penalty : 0;
        const totalFeeAmount = baseFee.amount + (baseFee.amount * baseFee.taxPercentage / 100) + penalty - offset;

        const alreadyPaidVerified = feeCollection.paymentTransactions
        .filter(t => t.verified)
        .reduce((sum, t) => sum + t.amount, 0);

        const scholarship = feeCollection.scholarshipAmt;
        const amountStillDue = totalFeeAmount - alreadyPaidVerified - scholarship;

        if (amountStillDue <= 0) continue;

        const paymentForThisFee = Math.min(remainingAmountToApply, amountStillDue);

        if (paymentForThisFee > 0) {
          const newTransaction = await tx.paymentTransaction.create({
            data: {
              amount: paymentForThisFee,
              paymentMethod: finalPaymentMethod,
              transactionId: transactionId,
              cashPayment: isCashPayment,
              paymentDate: paymentDate,
              feesCollectionId: feeCollection.id
            }
          });
          createdTransactions.push(newTransaction);

          remainingAmountToApply -= paymentForThisFee;

          const newTotalPaid = alreadyPaidVerified + paymentForThisFee;
          let newStatus: PaymentStatus;

          if (newTotalPaid >= totalFeeAmount - scholarship) {
            newStatus = PaymentStatus.PAID;
          } else if (isOverdue) {
            newStatus = PaymentStatus.OVERDUE;
          } else {
            newStatus = PaymentStatus.PARTIAL;
          }

          await tx.feesCollection.update({
            where: {id: feeCollection.id},
            data: {
              lastestPaymentDate: new Date(),
              status: newStatus,
            }
          });
        }
      }

      return {createdTransactions};
    });

    return NextResponse.json({
      message: "Payment processed successfully.",
      transactions: result.createdTransactions,
    }, {status: 200});

  } catch (error: any) {
    console.error("Error processing fee payment: ", error);
    // Handle the specific overpayment error
    if (error.message.includes("Overpayment not allowed")) {
      return NextResponse.json({error: error.message}, {status: 400});
    }
    if (error.message.includes("No pending fees")) {
      return NextResponse.json({error: error.message}, {status: 404});
    }
    return NextResponse.json({error: "An internal server error occurred.", details: error.message}, {status: 500});
  }
}