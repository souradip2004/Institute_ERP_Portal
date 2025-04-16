import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { password, hashedPassword } = await request.json();

    if (!password || !hashedPassword) {
      return NextResponse.json(
        { error: "Password and hashedPassword are required" },
        { status: 400 }
      );
    }

    // Test direct comparison
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    // Output what we're comparing
    console.log({
      password,
      hashedPassword,
      passwordMatch,
    });

    return NextResponse.json({
      match: passwordMatch,
      password,
      hashedPassword,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
