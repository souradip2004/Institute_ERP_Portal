import { NextRequest} from 'next/server';
import { QuestionController } from '@/controllers/questionController';

const questionController = new QuestionController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return questionController.getQuestionById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return questionController.updateQuestion(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return questionController.deleteQuestion(params.id);
}