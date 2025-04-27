import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    // Get auth token from cookie
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "TEACHER") {
      return NextResponse.json({ error: "User is not a teacher" }, { status: 403 });
    }

    // Get teacher details
    const teacher = await prisma.teacher.findFirst({
      where: { userId: user.id },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      teacher: {
        id: teacher.id,
        userId: teacher.userId,
        teacherCode: teacher.teacherCode,
        qualification: teacher.qualification,
        department: teacher.department,
        user: teacher.user
      }
    });
  } catch (error: any) {
    console.error("Error fetching teacher profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher profile: " + error.message },
      { status: 500 }
    );
  }
} 