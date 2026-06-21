import { NextRequest} from 'next/server';
import { QuestionController } from '@/controllers/questionController';

const questionController = new QuestionController();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return questionController.getQuestionById(params.id);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return questionController.updateQuestion(params.id, req);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return questionController.deleteQuestion(params.id);
}