import { NextRequest, NextResponse } from 'next/server';
import { TeacherController } from '@/controllers/teacherController';

const teacherController = new TeacherController();

export async function GET(req: NextRequest) {
  return teacherController.getAllTeachers(req);
}

export async function POST(req: NextRequest) {
  return teacherController.createTeacher(req);
}
