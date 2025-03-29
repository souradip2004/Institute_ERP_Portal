import { NextRequest, NextResponse } from 'next/server';
import { ExamController } from '@/controllers/examController';

const examController = new ExamController();

export async function GET(req: NextRequest) {
  return examController.getAllExams(req);
}

export async function POST(req: NextRequest) {
  return examController.createExam(req);
}
