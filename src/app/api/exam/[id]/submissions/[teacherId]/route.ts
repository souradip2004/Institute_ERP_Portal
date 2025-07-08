import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  req: NextRequest,
  {params}: { params: { id: string; teacherId: string } }
) {
  try {

    // Get teacher record
    const teacher = await prisma.teacher.findFirst({
      where: {userId: params.teacherId}
    });
    if (!teacher) {
      return NextResponse.json({error: "Teacher record not found"}, {status: 403});
    }

    const examId = params.id;

    // Get the exam with detailed question information
    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
        createdById: teacher.id,
      },
      include: {
        classSection: {
          include: {
            batch: true,
            semester: true
          }
        },
        examSubmissions: {
          include: {
            student: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                },
                studentRoll: true,
                currentYear: true,
                currentSemester: true,
                department: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
          }
        }
      }
    });
    if (!exam) {
      return NextResponse.json({error: "Exam not found"}, {status: 404});
    }

    return NextResponse.json({exam});
  } catch (error: any) {
    console.error("Error fetching exam details:", error);
    return NextResponse.json(
      {error: "Failed to fetch exam details", details: error.message},
      {status: 500}
    );
  }
}