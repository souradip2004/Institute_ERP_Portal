import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    // const motherClassId = searchParams.get('motherClassId') as string;
    const institutionId = searchParams.get('institutionId') as string;

    if (!institutionId) {
      return NextResponse.json({error: "All fields are required !"});
    }

    const motherClass = await prisma.motherClass.findMany({
      where: {
        institutionId
      },
      include: {
        classfee: {
          select: {
            globalFees: {
              select: {
                id: true,
                name: true,
                amount: true,
                taxPercentage: true,
                paymentterms: true,
                penalty: true,
                description: true,
                institutionId: true
              }
            }
          }
        },
      }
    });

    console.log("motherClass: ", motherClass);

    return NextResponse.json({motherClass}, {status: 200});

  } catch (e) {
    console.log(e);

    return NextResponse.json({error: "Internal server error. Please try again later."}, {status: 500});
  }
}