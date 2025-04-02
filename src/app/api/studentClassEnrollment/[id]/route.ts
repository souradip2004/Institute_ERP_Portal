import { NextRequest} from 'next/server';
import { StudentClassEnrollmentController } from '@/controllers/studentClassEnrollmentController';

const studentClassEnrollmentController = new StudentClassEnrollmentController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return studentClassEnrollmentController.getEnrollmentById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return studentClassEnrollmentController.updateEnrollment(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return studentClassEnrollmentController.deleteEnrollment(params.id);
}