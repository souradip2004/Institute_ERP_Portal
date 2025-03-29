import { NextRequest, NextResponse } from 'next/server';
import { StudentController } from '@/controllers/studentController';

const studentController = new StudentController();

export async function GET(req: NextRequest) {
  return studentController.getAllStudents(req);
}

export async function POST(req: NextRequest) {
  return studentController.createStudent(req);
}
