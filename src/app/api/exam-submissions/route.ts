import { NextRequest, NextResponse } from 'next/server';
import { ExamSubmissionController } from '@/controllers/examSubmissionController';

const examSubmissionController = new ExamSubmissionController();

export async function GET() {
  return examSubmissionController.getAll();
}

export async function POST(req: NextRequest) {
  return examSubmissionController.create(req);
}
