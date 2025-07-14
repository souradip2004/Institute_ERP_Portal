// api/exams/create (backend API route)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {

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
      difficultyLevel,
      isAiGenerated
    } = await req.json();
    console.log("Request body:", userId);
    const user = userId;

    let userDataFromDb;
    if (user && user.id) {
      try {
        userDataFromDb = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, institutionId: true }
        });

        if (!userDataFromDb) {
          console.log("User not found for ID:", user.id);
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

      } catch (fetchError) {
        console.error("Error fetching user data from DB:", fetchError);
        return NextResponse.json({ error: "Failed to verify user" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "User ID not provided" }, { status: 400 });
    }

    if (userDataFromDb.role !== "TEACHER") {
      console.log("User role:", userDataFromDb.role);
      return NextResponse.json({ error: "Unauthorized - Teacher access required" }, { status: 403 });
    }

    if (!userDataFromDb.institutionId) {
      console.log("User institution ID:", userDataFromDb.institutionId);
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
        institutionId: userDataFromDb.institutionId // Use institutionId from validated user data
      }
    });

    if (!examType) {
      examType = await prisma.examType.create({
        data: {
          name: "MCQ",
          description: "Multiple Choice Questions",
          institutionId: userDataFromDb.institutionId, // Use institutionId from validated user data
          weightage: 1.0
        }
      });
    }
    console.table([new Date(startTime), new Date(endTime), new Date(examDate)]);
    console.table([startTime, endTime, examDate]);
    // Create the exam
    const exam = await prisma.exam.create({
      data: {
        title,
        classSectionId,
        examTypeId: examType.id,
        createdById: teacher.id,
        status: "PUBLISHED",
        durationMinutes: parseInt(durationMinutes) || 60,
        totalMarks: parseFloat(totalMarks) || questions.length,
        passingMarks: parseFloat(passingMarks) || questions.length * 0.4,
        isAiGenerated,
        examDate: new Date(endTime).toISOString(),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime),
      },
    });
    console.log("Questions payload:", questions);
    const marks = parseFloat((parseFloat(totalMarks) / questions.length).toFixed(2));
    // Then create questions for the exam
    await prisma.question.createMany({
      data: questions.map((q: any) => ({
        examId: exam.id,
        questionText: q.question,
        questionType: q.questionType,
        diagramImgURL: q.diagramImgURL,
        correctAnswer: Array.isArray(q.answer) ? q.answer : [q.answer],
        marks,
        difficultyLevel,
        createdById: teacher.id,
        options: q.options || [], // Store options for MCQs
      }))
    });

    return NextResponse.json({ success: true, examId: exam.id });
  } catch (error: any) {
    console.error("Error creating exam:", error);
    console.log("Error creating exam:", error); // Keep this for immediate logging
    return NextResponse.json(
      { error: "Failed to create exam", details: error.message },
      { status: 500 }
    );
  }
}