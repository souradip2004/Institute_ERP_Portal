import { NextRequest, NextResponse } from 'next/server';
import { ExamController } from '@/controllers/examController';

const examController = new ExamController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return examController.getExamById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return examController.updateExam(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return examController.deleteExam(params.id);
}
