import { NextRequest, NextResponse } from 'next/server';
import { ExamTypeController } from '@/controllers/examTypeController';

const examTypeController = new ExamTypeController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Invalid Exam Type ID' }, { status: 400 });
    }

    return await examTypeController.getExamTypeById(params.id);
  } catch (error: any) {
    console.error(`Error in GET /api/exam-types/${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Invalid Exam Type ID' }, { status: 400 });
    }

    return await examTypeController.updateExamType(params.id, req);
  } catch (error: any) {
    console.error(`Error in PATCH /api/exam-types/${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Invalid Exam Type ID' }, { status: 400 });
    }

    return await examTypeController.deleteExamType(params.id);
  } catch (error: any) {
    console.error(`Error in DELETE /api/exam-types/${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
