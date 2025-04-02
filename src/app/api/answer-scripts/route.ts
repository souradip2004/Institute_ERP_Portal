import { NextRequest, NextResponse } from 'next/server';
import { AnswerScriptController } from '@/controllers/answerScriptController';

const answerScriptController = new AnswerScriptController();

export async function GET() {
  return answerScriptController.getAll();
}

export async function POST(req: NextRequest) {
  return answerScriptController.create(req);
}
