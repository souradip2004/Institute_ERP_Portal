import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    console.log(params.id)


    // Get teacher record
    const teacher = await prisma.teacher.findFirst({
      where: {userId: params.id}
    });

    if (!teacher) {
      return NextResponse.json({error: "Teacher record not found"}, {status: 403});
    }

    // Get all exams created by this teacher
    const exams = await prisma.exam.findMany({
      where: {
        createdById: teacher.id
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
                  select :{
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({exams});
  } catch (error: any) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      {error: "Failed to fetch exams", details: error.message},
      {status: 500}
    );
  }
}
