import {NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {Prisma} from '@prisma/client';

interface ScholarshipPayload {
  userId: string;
  studentId: string;
  scholarshipAmount: number;
  globalFeesId?: string;
  localFeesId?: string;
}

export async function PATCH(request: Request) {
  try {
    const body: ScholarshipPayload = await request.json();
    const {
      userId,
      studentId,
      scholarshipAmount,
      globalFeesId,
      localFeesId
    } = body;

    if (!userId || !studentId || scholarshipAmount === undefined || scholarshipAmount === null) {
      return NextResponse.json({error: "adminUserId, studentId, and scholarshipAmount are required."}, {status: 400});
    }

    if (!(globalFeesId || localFeesId) || (globalFeesId && localFeesId)) {
      return NextResponse.json({error: "Exactly one of 'globalFeesId' or 'localFeesId' must be provided."}, {status: 400});
    }

    if (scholarshipAmount < 0) {
      return NextResponse.json({error: "Scholarship amount cannot be negative."}, {status: 400});
    }

    const updateResult = await prisma.$transaction(async (tx) => {
      // Step A: Authenticate Admin User
      await tx.user.findUniqueOrThrow({
        where: {id: userId, role: "ADMIN"}
      });

      let baseAmount = 0;
      let classFeeWhereClause: Prisma.ClassFeeWhereInput;

      // Step B: Fetch the fee's base amount for validation
      if (globalFeesId) {
        const globalFee = await tx.globalFees.findUniqueOrThrow({
          where: {id: globalFeesId},
          select: {amount: true}
        });
        baseAmount = globalFee.amount;
        classFeeWhereClause = {globalFeesId: globalFeesId};
      } else if (localFeesId) {
        const localFee = await tx.localFees.findUniqueOrThrow({
          where: {id: localFeesId},
          select: {amount: true}
        });
        baseAmount = localFee.amount;
        classFeeWhereClause = {localFeesId: localFeesId};
      }

      if (scholarshipAmount > baseAmount) {
        throw new Error(`Invalid scholarship amount. The scholarship (${scholarshipAmount}) cannot exceed the fee's base amount (${baseAmount}).`);
      }

      const result = await tx.feesCollection.updateMany({
        where: {
          studentId: studentId,
          classFee: classFeeWhereClause!,
        },
        data: {
          scholarshipAmt: scholarshipAmount
        }
      });

      if (result.count === 0) {
        // This is not an error, but good feedback for the admin.
        // It means the student was not assigned any fees for the specified fee ID.
        console.log(`No fee collections found for student ${studentId} and feeId ${globalFeesId || localFeesId}. No records were updated.`);
      }

      return result;
    });

    return NextResponse.json({
      message: "Scholarship updated successfully.",
      updatedCount: updateResult.count
    }, {status: 200});

  } catch (error: any) {
    console.error("Error updating scholarship: ", error);

    // Handle specific Prisma "not found" error
    if (error.code === 'P2025') {
      return NextResponse.json({error: "Record not found. The provided admin, student, or fee ID is invalid."}, {status: 404});
    }

    // Handle our custom validation error
    if (error.message.includes("Invalid scholarship amount")) {
      return NextResponse.json({error: error.message}, {status: 400});
    }

    return NextResponse.json({error: "An internal server error occurred."}, {status: 500});
  }
}