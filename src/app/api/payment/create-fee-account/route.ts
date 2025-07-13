import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";

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

    // --- Basic Validation ---
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
        {error: 'Missing required fields'},
        {status: 400}
      );
    }

    // --- Create Fees Record in Database ---
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

    return NextResponse.json(newFees, {status: 201});
  } catch (error) {
    console.error('Error creating fees:', error);
    return NextResponse.json(
      {error: 'An internal server error occurred.'},
      {status: 500}
    );
  }
}
