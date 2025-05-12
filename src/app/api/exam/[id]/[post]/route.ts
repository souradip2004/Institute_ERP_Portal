import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string;post:string } }
) {
  try {
  
    // Get teacher record
    const teacher = await prisma.teacher.findFirst({
      where: { userId: params.post }
    });
    if (!teacher) {
      return NextResponse.json({ error: "Teacher record not found" }, { status: 403 });
    }

    const examId = params.id;
    
    // Get the exam with detailed question information
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        createdById: teacher.id
      },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            correctAnswer: true,
            marks: true,
            difficultyLevel: true
          }
        },
        classSection: {
          include: {
            batch: true,
            semester: true
          }
        },
        examType: true
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ exam });
  } catch (error: any) {
    console.error("Error fetching exam details:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam details", details: error.message },
      { status: 500 }
    );
  }
} 