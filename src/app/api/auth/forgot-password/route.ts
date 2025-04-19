// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/services/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security reasons, don't reveal if a user exists or not
    // Always return success even if the email doesn't exist
    if (!user) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // If the user is using a social login provider without a password,
    // we should not allow them to reset a password they don't have
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses social login and cannot reset password" },
        { status: 400 }
      );
    }

    // Delete any existing password reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        token: {
          startsWith: "password-reset-", // Use a prefix to identify password reset tokens
        },
      },
    });

    // Create a password reset token
    const token = `password-reset-${crypto.randomUUID()}`;
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // Send password reset email
    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
