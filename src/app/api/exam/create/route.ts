import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        role: true,
        institutionId: true
      }
    });

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized - Teacher access required" }, { status: 403 });
    }

    if (!user.institutionId) {
      return NextResponse.json({ error: "Teacher must be associated with an institution" }, { status: 400 });
    }

    // Get teacher record
    const teacher = await prisma.teacher.findFirst({
      where: { userId: decoded.id }
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher record not found" }, { status: 403 });
    }

    const { 
      title, 
      questions, 
      classSectionId,
      durationMinutes,
      totalMarks,
      passingMarks,
      examDate,
      startTime,
      endTime,
      isAiGenerated = true
    } = await req.json();

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid exam data" }, { status: 400 });
    }

    if (!classSectionId) {
      return NextResponse.json({ error: "Class section is required" }, { status: 400 });
    }

    // Validate class section belongs to teacher
    const classSection = await prisma.classSection.findFirst({
      where: {
        id: classSectionId,
        teacherId: teacher.id
      }
    });

    if (!classSection) {
      return NextResponse.json({ error: "Invalid class section" }, { status: 400 });
    }

    // First create the exam type if it doesn't exist
    let examType = await prisma.examType.findFirst({
      where: {
        name: "MCQ",
        institutionId: user.institutionId
      }
    });

    if (!examType) {
      examType = await prisma.examType.create({
        data: {
          name: "MCQ",
          description: "Multiple Choice Questions",
          institutionId: user.institutionId,
          weightage: 1.0
        }
      });
    }

    // Create the exam
    const exam = await prisma.exam.create({
      data: {
        title,
        classSectionId,
        examTypeId: examType.id,
        createdById: teacher.id,
        status: "DRAFT",
        durationMinutes: parseInt(durationMinutes) || 60,
        totalMarks: parseFloat(totalMarks) || questions.length,
        passingMarks: parseFloat(passingMarks) || questions.length * 0.4,
        isAiGenerated,
        examDate: new Date(examDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    // Then create questions for the exam
    await prisma.question.createMany({
      data: questions.map((q: any) => ({
        examId: exam.id,
        questionText: q.question,
        questionType: "MCQ",
        correctAnswer: Array.isArray(q.answer) ? q.answer : [q.answer],
        marks: 1,
        difficultyLevel: "MEDIUM",
        createdById: teacher.id,
        options: [], // Add options if available
      })),
    });

    return NextResponse.json({ success: true, examId: exam.id });
  } catch (error: any) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam", details: error.message },
      { status: 500 }
    );
  }
}
