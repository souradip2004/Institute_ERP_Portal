// api/auth/username-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user by username (name field)
    const user = await prisma.user.findFirst({
      where: {
        username,
        ...(role ? { role } : {}), // Only include role in query if provided
      },
      include: {
        student: true,
        teacher: true,
      },
    }).then((data)=>{return data}).catch((e)=>{console.log(e)})

    console.log(user);
    console.log(user?.password);

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session object compatible with NextAuth
    const session = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        emailVerified: new Date(), // Set to current date to bypass verification check
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };

    // Generate JWT token
    const token = sign(session, process.env.NEXTAUTH_SECRET || "your-secret", {
      expiresIn: "30d",
    });
    // Set cookie compatible with NextAuth
    const cookieStore = cookies();
    (await cookieStore).set("next-auth.session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(session.expires),
      path: "/",
    });

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}