import { NextRequest, NextResponse } from 'next/server';
import { StudentClassEnrollmentController } from '@/controllers/studentClassEnrollmentController';

const studentClassEnrollmentController = new StudentClassEnrollmentController();

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return studentClassEnrollmentController.getEnrollmentById(id);
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return studentClassEnrollmentController.updateEnrollment(id, req);
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return studentClassEnrollmentController.deleteEnrollment(id);
}
