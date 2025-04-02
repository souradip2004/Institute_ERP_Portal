import { NextRequest, NextResponse } from 'next/server';
import { AnswerScriptController } from '@/controllers/answerScriptController';

const answerScriptController = new AnswerScriptController();

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return answerScriptController.getById(id);
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return answerScriptController.update(id, req);
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return answerScriptController.delete(id);
}
