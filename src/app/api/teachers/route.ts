import { NextRequest, NextResponse } from 'next/server';
import {TeacherService} from '@/services/teacherService';
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import jwt from 'jsonwebtoken';

// export async function GET(req: NextRequest) {
//   try {
//     // Get auth token from cookie
//     const token = req.cookies.get('auth_token')?.value;
    
//     if (!token) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
//     if (!decoded || !decoded.id) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     // Get the student's data including their department
//     const student = await prisma.student.findFirst({
//       where: { userId: decoded.id },
//       include: { department: true }
//     });

//     if (!student) {
//       return NextResponse.json({ error: "Student not found" }, { status: 404 });
//     }

//     // Get teachers from the same department
//     const teachers = await prisma.teacher.findMany({
//       where: {
//         departmentId: student.departmentId
//       },
//       include: {
//         user: true,
//         department: true
//       }
//     });

//     return NextResponse.json(teachers);
//   } catch (error) {
//     console.error("Error fetching teachers:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch teachers" },
//       { status: 500 }
//     );
//   }
// }

export async function GET() {
  try {
    const service = new TeacherService();
    const teachers = await service.getAllTeachers();

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
  
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
