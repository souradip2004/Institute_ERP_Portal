import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    const studentId = searchParams.get('studentId');
    const motherClassId = searchParams.get('motherClassId');

    if (!institutionId || !studentId || !motherClassId) {
      return NextResponse.json({
        error: "Missing required parameters. 'institutionId', 'studentId', and 'motherClassId' are required."
      }, { status: 400 });
    }

    const feeDetails = await prisma.classFee.findMany({
      where: {
        // Find class fees linked to this specific class
        motherClassId: motherClassId,
        // Ensure we are only fetching Global Fees, not Local Fees
        globalFeesId: {
          not: null
        },
        // Security: Ensure the fee belongs to the specified institution
        globalFees: {
          institutionId: institutionId,
        }
      },
      include: {
        // Include the full details of the global fee
        globalFees: true,
        // Include the collection records, but ONLY for the specified student
        feesCollections: {
          where: {
            studentId: studentId
          }
        }
      }
    });

    // 3. Transform the data into a structured, user-friendly response
    const structuredResponse = feeDetails
    .filter(detail => detail.globalFees) // Filter out any nulls just in case
    .map(detail => {
      // The 'feesCollections' array will have either one item (if a record exists for the student)
      // or zero items. We extract the single record or return null.
      const collectionDetails = detail.feesCollections[0] || null;

      return {
        feeId: detail.globalFees!.id,
        name: detail.globalFees!.name,
        description: detail.globalFees!.description,
        amountDue: detail.globalFees!.amount,
        taxPercentage: detail.globalFees!.taxPercentage,
        penalty: detail.globalFees!.penalty,
        paymentTerms: detail.globalFees!.paymentterms,
        classFeeId: detail.id,
        // Student-specific payment information
        paymentStatus: collectionDetails?.status || 'NOT_GENERATED', // Provides a clear status if no record was found
        amountPaid: collectionDetails?.amount, // This will be the amount from the collection record
        paymentDate: collectionDetails?.paymentDate,
        paymentMethod: collectionDetails?.paymentMethod,
        transactionId: collectionDetails?.transactionId,
        feesCollectionId: collectionDetails?.id || null // The ID of the specific fee collection record
      };
    });

    return NextResponse.json(structuredResponse, { status: 200 });

  } catch (error) {
    console.error("Error fetching student fee details: ", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}