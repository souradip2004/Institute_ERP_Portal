import { NextRequest} from 'next/server';
import { StudentClassEnrollmentController } from '@/controllers/studentClassEnrollmentController';

const studentClassEnrollmentController = new StudentClassEnrollmentController();

export async function GET(req: NextRequest) {
  return studentClassEnrollmentController.getAllEnrollments(req);
}

export async function POST(req: NextRequest) {
  return studentClassEnrollmentController.createEnrollment(req);
}