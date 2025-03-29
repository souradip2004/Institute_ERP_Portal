import { NextRequest, NextResponse } from 'next/server';
import { TeacherController } from '@/controllers/teacherController';

const teacherController = new TeacherController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return teacherController.getTeacherById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return teacherController.updateTeacher(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return teacherController.deleteTeacher(params.id);
}
