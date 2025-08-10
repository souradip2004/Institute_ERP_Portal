import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {

    const {searchParams} = new URL(request.url);
    const globalFeesId = searchParams.get('globalFeesId') as string;

    if (!globalFeesId) {
      return NextResponse.json({error: "GlobalFeesId required"}, {status: 404});
    }

    const deleted = await prisma.globalFees.delete({
      where: {
        id: globalFeesId
      }
    });
    console.log("deleted: ", deleted);

    return NextResponse.json(deleted, {status: 200});


  } catch (e) {
    console.log("Error in GET: ", e);

    return NextResponse.json({error: "Internal server error. Please try again later."}, {status: 500});
  }
}