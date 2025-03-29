import { NextRequest, NextResponse } from 'next/server';
import { QuestionController } from '@/controllers/questionController';

const questionController = new QuestionController();

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return questionController.getQuestionById(id);
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return questionController.updateQuestion(id, req);
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return questionController.deleteQuestion(id);
}
