import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

interface TransactionVerification {
  id: string;
  verified: boolean;
}

interface VerificationPayload {
  feesCollectionId: string;
  userId: string;
  transactions: TransactionVerification[];
}

export async function PATCH(request: Request) {
  try {
    const body: VerificationPayload = await request.json();
    const {feesCollectionId, userId, transactions} = body;

    if (!feesCollectionId || !userId || !Array.isArray(transactions)) {
      return NextResponse.json({
        error: "feesCollectionId, userId, and a transactions array are required."
      }, {status: 400});
    }

    if (transactions.length === 0) {
      return NextResponse.json({
        error: "The transactions array cannot be empty."
      }, {status: 400});
    }

    const adminExists = await prisma.user.findUnique({
      where: {id: userId, role: "ADMIN"}
    });

    if (!adminExists) {
      return NextResponse.json({error: "Admin user not found or does not have permission."}, {status: 403});
    }

    // --- 3. Atomic Transaction for Updates and Verification ---
    const updatedFeesCollection = await prisma.$transaction(async (tx) => {
      await Promise.all(
        transactions.map(t =>
          tx.paymentTransaction.update({
            where: {id: t.id},
            data: {verified: t.verified}
          })
        )
      );

      const allRelatedTransactions = await tx.paymentTransaction.findMany({
        where: {feesCollectionId: feesCollectionId},
        select: {verified: true}
      });


      const areAllVerified = allRelatedTransactions.length > 0 && allRelatedTransactions.every(t => t.verified);

      // Step D: Update the parent FeesCollection with the new aggregated status
      const finalCollection = await tx.feesCollection.update({
        where: {id: feesCollectionId},
        data: {verified: areAllVerified},
        // Include the updated transactions in the response for the client
        include: {
          paymentTransactions: {
            orderBy: {paymentDate: 'desc'}
          }
        }
      });

      return finalCollection;
    });

    return NextResponse.json(updatedFeesCollection, {status: 200});

  } catch (e: any) {
    console.error("Error during fee verification update: ", e);

    // Handle specific Prisma error for "record not found"
    if (e.code === 'P2025') {
      return NextResponse.json({error: "Record not found. One of the provided IDs (feesCollectionId or a transaction ID) is invalid."}, {status: 404});
    }

    return NextResponse.json({error: "An internal server error occurred."}, {status: 500})
  }
}