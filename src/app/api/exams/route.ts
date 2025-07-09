import { NextRequest, NextResponse } from 'next/server';
import { ExamController } from '@/controllers/examController';

const examController = new ExamController();

export async function GET(req: NextRequest) {
  return examController.getAllExams(req);
}

export async function POST(req: NextRequest) {
  return examController.createExam(req);
}
//export async function GET(req: NextRequest, {params}: { params: { createdBy: string } }) {
 // const {createdBy} = params;
 // return examController.getAllExamsByCreatedBy(req, createdBy);
//}