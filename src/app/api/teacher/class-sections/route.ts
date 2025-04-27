import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    console.log("=== FETCHING TEACHER CLASS SECTIONS ===");
    
    // Get auth token from cookie
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      console.log("No auth token found in cookies");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    if (!decoded || !decoded.id) {
      console.log("Invalid token or missing user ID");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    console.log(`Token decoded - User ID: ${decoded.id}`);

    // Get user details first to verify they're a teacher
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
      console.log(`User not found for ID: ${decoded.id}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`Found user: ${user.name} (${user.id}), role: ${user.role}`);

    if (user.role !== "TEACHER") {
      console.log(`User is not a teacher: ${user.id}, role: ${user.role}`);
      return NextResponse.json({ error: "User is not a teacher" }, { status: 403 });
    }

    // Get teacher record
    const teacher = await prisma.teacher.findFirst({
      where: { userId: decoded.id },
      select: {
        id: true,
        teacherCode: true,
        userId: true,
        departmentId: true
      }
    });

    if (!teacher) {
      console.log(`Teacher record not found for user ID: ${decoded.id}`);
      return NextResponse.json({ error: "Teacher record not found" }, { status: 403 });
    }

    console.log(`Teacher found with ID: ${teacher.id}`);

    // Get the teacher's course-section relationships
    const teacherCourseSections = await prisma.teacherCourseSectionRelation.findMany({
      where: { 
        teacherId: teacher.id 
      },
      include: {
        course: true,
        classSection: {
          include: {
            batch: true,
            semester: true
          }
        }
      }
    });

    console.log(`Found ${teacherCourseSections.length} course-section relationships`);

    // Transform the data into a more usable format for the frontend
    const classSections = teacherCourseSections.map(relation => {
      return {
        id: relation.classSection.id,
        sectionName: relation.classSection.sectionName,
        batch: relation.classSection.batch,
        semester: relation.classSection.semester,
        course: relation.course,
        teacherId: relation.classSection.teacherId,
        batchId: relation.classSection.batchId,
        semesterId: relation.classSection.semesterId
      };
    });

    // Log a sample of the data
    if (classSections.length > 0) {
      console.log("Sample class section data:", JSON.stringify(classSections[0], null, 2));
    }

    return NextResponse.json({ 
      classSections,
      teacher: {
        id: teacher.id,
        code: teacher.teacherCode,
        userId: teacher.userId,
        departmentId: teacher.departmentId
      }
    });
  } catch (error: any) {
    console.error("Error fetching class sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch class sections", details: error.message },
      { status: 500 }
    );
  }
}