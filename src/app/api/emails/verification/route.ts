// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { verifyMail } from "@/services/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email,userId,institutionid,institutionName,document,studentcounts,teachercount } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await verifyMail(email, userId, institutionid, institutionName, document, studentcounts, teachercount);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
