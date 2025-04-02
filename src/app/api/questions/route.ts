import { NextRequest} from 'next/server';
import { QuestionController } from '@/controllers/questionController';

const questionController = new QuestionController();

export async function GET(req: NextRequest) {
  return questionController.getAllQuestions(req);
}

export async function POST(req: NextRequest) {
  return questionController.createQuestion(req);
}