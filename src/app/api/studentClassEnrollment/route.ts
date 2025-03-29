import { NextRequest, NextResponse } from 'next/server';
import { StudentClassEnrollmentController } from '@/controllers/studentClassEnrollmentController';

const studentClassEnrollmentController = new StudentClassEnrollmentController();

export async function GET() {
  return studentClassEnrollmentController.getAllEnrollments();
}

export async function POST(req: NextRequest) {
  return studentClassEnrollmentController.createEnrollment(req);
}
