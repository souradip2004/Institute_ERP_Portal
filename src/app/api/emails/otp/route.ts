import { NextRequest, NextResponse } from "next/server";

import { sendOtpEmail } from "@/services/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email,otp } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await sendOtpEmail(email,otp);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
