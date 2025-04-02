import { NextRequest, NextResponse } from 'next/server';
import { ExamSubmissionController } from '@/controllers/examSubmissionController';

const examSubmissionController = new ExamSubmissionController();

// Search exam submision by student id
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return examSubmissionController.getById(id);
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return examSubmissionController.update(id, req);
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return examSubmissionController.delete(id);
}
