// api/auth/username-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, role } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
        ...(role ? { role } : {}), // Only include role in query if provided
      },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password by pass password
    // const passwordMatch = await bcrypt.compare(password, user.password);
    // if (!passwordMatch) {
    //   return NextResponse.json(
    //     { error: "Invalid credentials" },
    //     { status: 401 }
    //   );
    // }

    // Create user object to store in cookie and return to client
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      studentId: user.student?.id || null,
      teacherId: user.teacher?.id || null,
    };

    // Generate JWT token
    const token = sign(userData, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    });

    // Create the response
    const response = NextResponse.json({
      success: true,
      token,
      user: userData,
    });

    // Set the cookie in the response
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    console.log("custom login attempt and response sent to client");
    // console.log(response)
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
