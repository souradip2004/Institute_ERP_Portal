import { NextRequest, NextResponse } from 'next/server';
import { TeacherController } from '@/controllers/teacherController';

const teacherController = new TeacherController();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return teacherController.getTeacherById(params.id);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return teacherController.updateTeacher(params.id, req);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return teacherController.deleteTeacher(params.id);
}
