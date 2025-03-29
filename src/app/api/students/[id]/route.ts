import { NextRequest, NextResponse } from 'next/server';
import { StudentController } from '@/controllers/studentController';

const studentController = new StudentController();

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params; // Ensure params are awaited
  return studentController.getStudentById(id);
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params; // Await params
  return studentController.updateStudent(id, req);
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params; // Await params
  return studentController.deleteStudent(id);
}
