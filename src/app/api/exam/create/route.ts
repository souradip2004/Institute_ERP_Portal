import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    // Get auth token from cookie


    const { 
      userId,
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
    console.log("Request body:", userId);
    //get user details from req

    const user = userId;
    const newuser=await fetch(`http://localhost:3000/api/users/${userId.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.headers.get('Authorization')}`
      }
    })
    const userData = await newuser.json();
    if (!user || user.role !== "TEACHER") {
      console.log("User role:", user.role);
      return NextResponse.json({ error: "Unauthorized - Teacher access required" }, { status: 403 });
    }

    if (!userData.institutionId) {
      console.log("User institution ID:", userData.institutionId);
      return NextResponse.json({ error: "Teacher must be associated with an institution" }, { status: 400 });
    }

    // Get teacher record
    const teacher = await prisma.teacher.findFirst({
      where: { userId: user.id }
    });

    if (!teacher) {
      console.log("Teacher record not found for user ID:", user.id);
      return NextResponse.json({ error: "Teacher record not found" }, { status: 403 });
    }

    if (!title || !questions || !Array.isArray(questions)) {
      console.log("Exam data:", { title, questions });
      return NextResponse.json({ error: "Invalid exam data" }, { status: 400 });
    }

    if (!classSectionId) {
      console.log("Class section ID is required");
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
      console.log("Class section not found for teacher ID:", teacher.id);
      return NextResponse.json({ error: "Invalid class section" }, { status: 400 });
    }

    // First create the exam type if it doesn't exist
    let examType = await prisma.examType.findFirst({
      where: {
        name: "MCQ",
        institutionId: userData.institutionId
      }
    });

    if (!examType) {
      examType = await prisma.examType.create({
        data: {
          name: "MCQ",
          description: "Multiple Choice Questions",
          institutionId: userData.institutionId,
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
    console.log("Error creating exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam", details: error.message },
      { status: 500 }
    );
  }
}
