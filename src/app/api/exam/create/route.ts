// api/exams/create (backend API route)

import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    // --- 1. Data Deserialization & Initial Validation (Outside Transaction) ---
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

    if (!userId || !userId.id) {
      return NextResponse.json({error: "User ID not provided"}, {status: 400});
    }

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({error: "Invalid exam data provided"}, {status: 400});
    }

    if (!classSectionId) {
      return NextResponse.json({error: "Class section is required"}, {status: 400});
    }

    // --- 2. Authorization and Prerequisite Checks (Read-only, outside transaction) ---
    const user = await prisma.user.findUnique({
      where: {id: userId.id},
      select: {role: true, institutionId: true}
    });

    if (!user) {
      return NextResponse.json({error: "User not found"}, {status: 404});
    }

    if (user.role !== "TEACHER") {
      return NextResponse.json({error: "Unauthorized - Teacher access required"}, {status: 403});
    }

    if (!user.institutionId) {
      return NextResponse.json({error: "Teacher must be associated with an institution"}, {status: 400});
    }

    const teacher = await prisma.teacher.findFirst({
      where: {userId: userId.id}
    });

    if (!teacher) {
      return NextResponse.json({error: "Teacher record not found"}, {status: 403});
    }

    const classSection = await prisma.classSection.findFirst({
      where: {id: classSectionId, teacherId: teacher.id}
    });

    if (!classSection) {
      return NextResponse.json({error: "Invalid class section or not assigned to this teacher"}, {status: 400});
    }

    // --- 3. Atomic Database Operations (Inside a Transaction) ---
    // The entire block below will either succeed completely or fail and roll back.
    const newExam = await prisma.$transaction(async (tx) => {
      // Find or create the ExamType using the transactional client `tx`
      let examType = await tx.examType.findFirst({
        where: {
          name: "MCQ",
          institutionId: user.institutionId!
        }
      });

      if (!examType) {
        examType = await tx.examType.create({
          data: {
            name: "MCQ",
            description: "Multiple Choice Questions",
            institutionId: user.institutionId!,
            weightage: 1.0
          }
        });
      }

      // Create the Exam using `tx`
      const exam = await tx.exam.create({
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
          examDate: new Date(examDate),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime),
        },
      });

      // Prepare questions data
      const marksPerQuestion = parseFloat((parseFloat(totalMarks) / questions.length).toFixed(2));
      const questionsData = questions.map((q: any, index: number) => ({
        examId: exam.id, // Use the ID from the exam created above
        questionText: q.question,
        questionType: q.questionType,
        diagramImgURL: q.diagramImgURL,
        qNo: index + 1,
        correctAnswer: Array.isArray(q.answer) ? q.answer : [q.answer],
        marks: marksPerQuestion,
        difficultyLevel,
        createdById: teacher.id,
        options: q.options || []
      }));

      // Create all questions using `tx`
      await tx.question.createMany({
        data: questionsData
      });

      // Return the created exam from the transaction
      return exam;
    });

    // --- 4. Success Response ---
    console.log(`Successfully created exam with ID: ${newExam.id}`);
    return NextResponse.json({success: true, examId: newExam.id});

  } catch (error: any) {
    // Catches errors from validation, the transaction, or any other part of the function
    console.error("Error creating exam:", error);
    return NextResponse.json(
      {error: "Failed to create exam", details: error.message},
      {status: 500}
    );
  }
}