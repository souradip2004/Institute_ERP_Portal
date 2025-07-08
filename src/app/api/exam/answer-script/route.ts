import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  req: NextRequest
) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id') as string;
    const examId = searchParams?.get('examId') as string;
    const studentId = searchParams.get('studentId') as string;


    if (!id || !studentId) {
      return NextResponse.json(
        { error: "Missing required parameters: id, examId, and studentId" },
        { status: 400 }
      );
    }

    // Get teacher record
    const student = await prisma.student.findFirst({
      where: {id: studentId}
    });
    if (!student) {
      return NextResponse.json({error: "Student record not found"}, {status: 403});
    }

    // Get the exam with detailed question information
    const examSubmission = await prisma.examSubmission.findUnique({
      where: {
        id: id,
        studentId: studentId,
      },
      include: {
        answerScripts: {
          select: {
            id: true,
            studentAnswer: true,
            question: {
              select: {
                questionText: true,
                questionType: true,
                correctAnswer: true,
                marks: true,
                difficultyLevel: true
              }
            }
          }
        }
      }
    });

    if (!examSubmission) {
      return NextResponse.json({error: "Exam not found"}, {status: 404});
    }

    return NextResponse.json({examSubmission});
  } catch (error: any) {
    console.error("Error fetching exam details:", error);
    return NextResponse.json(
      {error: "Failed to fetch exam details", details: error.message},
      {status: 500}
    );
  }
}