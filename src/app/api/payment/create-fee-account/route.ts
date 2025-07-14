import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { undefined } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      institutionId,
      accountHolder,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
      upiqrCode,
      email,
      password,
    } = body;

    if (
      !institutionId ||
      !accountHolder ||
      !accountNumber ||
      !ifscCode ||
      !bankName ||
      !branchName ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newFees = await prisma.fees.create({
      data: {
        institutionId,
        accountHolder,
        accountNumber,
        ifscCode,
        bankName,
        branchName,
        upiqrCode,
        email,
        password
      },
    });

    return NextResponse.json(newFees, { status: 201 });
  } catch (error) {
    console.error('Error creating fees:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId') as string;

    const instituteFeeDetail = await prisma.fees.findUnique({
      where: {
        institutionId: institutionId
      }
    })

    if (!instituteFeeDetail) {
      return NextResponse.json({ error: "Institute fee detail not found." }, { status: 404 });
    }

    return NextResponse.json(instituteFeeDetail, { status: 200 });
  } catch (e: any) {
    console.log("Error in GET: ", e.message);

    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      accountHolder,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
      upiqrCode,
    } = body;

    if (
      !id ||
      !accountHolder ||
      !accountNumber ||
      !ifscCode ||
      !bankName ||
      !branchName
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedFeesDetail = await prisma.fees.update({
      where: {
        id: id
      },
      data: {
        accountHolder,
        accountNumber,
        ifscCode,
        bankName,
        branchName,
        upiqrCode
      }
    })

    console.log("Updated Fees Detail: ", updatedFeesDetail);

    return NextResponse.json(updatedFeesDetail, { status: 200 });


  } catch (e: any) {

    console.error("Error in PATCH: ", e);

    return NextResponse.json({
      error: "An internal server error occurred."
    }, { status: 500 })
  }
}

// export async function DELETE(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const institutionId = searchParams.get('institutionId') as string;

//     const instituteFeeDetail = await prisma.fees.delete({
//       where: {
//         id: institutionId
//       }
//     })

//     if (!instituteFeeDetail) {
//       return NextResponse.json({ error: "Institute fee detail not found." }, { status: 404 });
//     }

//     return NextResponse.json(instituteFeeDetail, { status: 200 });
//   } catch (e: any) {
//     console.log("Error in GET: ", e.message);

//     return NextResponse.json(
//       { error: "An internal server error occurred." },
//       { status: 500 }
//     )
//   }
// }