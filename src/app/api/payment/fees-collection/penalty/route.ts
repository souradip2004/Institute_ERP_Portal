import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {applyPenalty, feesCollectionId, userId}: {
      applyPenalty: boolean,
      feesCollectionId: string,
      userId: string
    } = body;

    if (!(applyPenalty === true || applyPenalty === false) || !feesCollectionId || !userId) {
      return NextResponse.json({error: "isVerified and feesCollectionId are required!"});
    }

    const adminExists = await prisma.user.findUnique({
      where: {
        id: userId,
        role: "ADMIN"
      }
    });

    if (!adminExists) {
      return NextResponse.json({error: "User doesn't exist!"}, {status: 404});
    }

    const updatedFeesCollection = await prisma.feesCollection.update({
      where: {
        id: feesCollectionId
      },
      data: {
        penaltyApplied: applyPenalty
      }
    });

    return NextResponse.json(updatedFeesCollection, {status: 200});

  } catch (e) {
    console.error(e);

    return NextResponse.json({message: "Internal server error. Please try again later."}, {status: 500})
  }
}