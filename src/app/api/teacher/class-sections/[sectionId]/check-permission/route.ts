import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  req: NextRequest,
  { params }: { params: { sectionId: string } }
) {
  try {
    const sectionId = params.sectionId;
    
    if (!sectionId) {
      return NextResponse.json({ error: "Section ID is required" }, { status: 400 });
    }

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

    // Check if user is a teacher
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        role: true,
        id: true
      }
    });

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ 
        hasPermission: false, 
        error: "Only teachers can create exams" 
      }, { status: 403 });
    }

    // Get teacher record
    const teacher = await prisma.teacher.findFirst({
      where: { userId: user.id }
    });

    if (!teacher) {
      return NextResponse.json({ 
        hasPermission: false, 
        error: "Teacher record not found" 
      }, { status: 403 });
    }

    // Get class section
    const classSection = await prisma.classSection.findFirst({
      where: {
        id: sectionId,
        teacherId: teacher.id
      }
    });

    // Check if teacher is assigned to this class section
    if (!classSection) {
      // Try to find the section itself to give a better error message
      const section = await prisma.classSection.findUnique({
        where: { id: sectionId },
        select: { teacherId: true }
      });

      if (!section) {
        return NextResponse.json({ 
          hasPermission: false, 
          error: "Class section not found" 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        hasPermission: false, 
        error: "You don't have permission for this class section",
        teacherId: teacher.id,
        sectionTeacherId: section.teacherId
      });
    }

    return NextResponse.json({ 
      hasPermission: true,
      teacherId: teacher.id,
      classSection
    });
  } catch (error: any) {
    console.error("Error checking class section permission:", error);
    return NextResponse.json({ 
      hasPermission: false, 
      error: "Failed to check permission: " + error.message 
    }, { status: 500 });
  }
} 