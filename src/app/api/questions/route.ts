import { NextRequest, NextResponse } from 'next/server';
import { QuestionController } from '@/controllers/questionController';

const questionController = new QuestionController();

export async function GET() {
  return questionController.getAllQuestions();
}

export async function POST(req: NextRequest) {
  return questionController.createQuestion(req);
}
