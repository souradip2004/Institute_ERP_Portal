import {NextRequest, NextResponse} from 'next/server';
import {ExamController} from '@/controllers/examController';

const examController = new ExamController();

export async function GET(req: NextRequest, {params}: { params: { createdBy: string } }) {
  const {createdBy} = params;
  return examController.getAllExamsByCreatedBy(req, createdBy);
}


export async function POST(req: NextRequest) {
  return examController.createExam(req);
}
