import { NextRequest, NextResponse } from 'next/server';
import { SemesterController } from '@/controllers/semesterController';

const semesterController = new SemesterController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Invalid Semester ID' }, { status: 400 });
    }

    return await semesterController.getSemesterById(params.id);
  } catch (error: any) {
    console.error(`Error in GET /api/semesters/${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Invalid Semester ID' }, { status: 400 });
    }

    return await semesterController.updateSemester(params.id, req);
  } catch (error: any) {
    console.error(`Error in PATCH /api/semesters/${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Invalid Semester ID' }, { status: 400 });
    }

    return await semesterController.deleteSemester(params.id);
  } catch (error: any) {
    console.error(`Error in DELETE /api/semesters/${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
