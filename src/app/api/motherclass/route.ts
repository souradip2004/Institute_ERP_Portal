import { NextRequest, NextResponse } from 'next/server';
import { MotherClassEnrollmentController } from '@/controllers/motherClassController';

const motherClass = new MotherClassEnrollmentController();

export async function GET(req: NextRequest) {
  return motherClass.getAllEnrollments(req);
}

export async function POST(req: NextRequest) {
  return motherClass.createEnrollment(req);
}
