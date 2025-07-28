import {NextRequest, NextResponse} from 'next/server';
import {StudentController} from '@/controllers/studentController';
import prisma from "@/lib/prisma";

const studentController = new StudentController();

export async function GET(req: NextRequest) {
  return studentController.getAllStudents(req);
}

export async function POST(req: NextRequest) {
  return studentController.createStudent(req);
}

export async function DELETE(req: Request) {
  try {
    const {searchParams} = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({error: "userId required "}, {status: 400});
    }

    const studentExists = await prisma.student.findUnique({
      where: {
        userId
      }
    });

    if (!studentExists) {
      return NextResponse.json({error: "Student doesn't exist !"}, {status: 404});
    }

    const deletedStudent = await prisma.student.delete({
      where: {
        userId
      }
    });

    console.log("Deleted student ", deletedStudent);

    return NextResponse.json({message: "Successfully deleted ", deletedStudent}, {status: 200});
  } catch (e: any) {
    console.error(e);

    return NextResponse.json({message: "Internal server error !"}, {status: 500});
  }
}