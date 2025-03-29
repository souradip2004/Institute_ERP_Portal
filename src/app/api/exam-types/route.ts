
import { NextRequest, NextResponse } from 'next/server';
import { ExamTypeController } from '@/controllers/examTypeController';

const examTypeController = new ExamTypeController();

export async function GET(req: NextRequest) {
  try {
    return await examTypeController.getAllExamTypes();
  } catch (error: any) {
    console.error('Error in GET /api/exam-types:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await examTypeController.createExamType(req);
  } catch (error: any) {
    console.error('Error in POST /api/exam-types:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
