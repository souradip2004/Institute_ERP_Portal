import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {

    const {searchParams} = new URL(request.url);
    const localFeesId = searchParams.get('localFeesId') as string;

    if (!localFeesId) {
      return NextResponse.json({error: "localFeesId required !"}, {status: 400});
    }

    const deleted = await prisma.localFees.delete({
      where: {
        id: localFeesId
      }
    });

    console.log("deleted: ", deleted);

    return NextResponse.json(deleted, {status: 200});

  } catch (e: any) {
    console.log("Error ", e);

    return NextResponse.json({error: "Internal server error", message: e.message})
  }
}