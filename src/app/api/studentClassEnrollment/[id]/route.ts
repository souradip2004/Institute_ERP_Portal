import { NextRequest} from 'next/server';
import { StudentClassEnrollmentController } from '@/controllers/studentClassEnrollmentController';

const studentClassEnrollmentController = new StudentClassEnrollmentController();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return studentClassEnrollmentController.getEnrollmentById(params.id);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return studentClassEnrollmentController.updateEnrollment(params.id, req);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return studentClassEnrollmentController.deleteEnrollment(params.id);
}