import { NextRequest, NextResponse } from 'next/server';
import { SemesterController } from '@/controllers/semesterController';

const semesterController = new SemesterController();

export async function GET(req: NextRequest) {
  try {
    return await semesterController.getAllSemesters();
  } catch (error: any) {
    console.error('Error in GET /api/semesters:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('hi'); // Debugging log
    return await semesterController.createSemester(req);
  } catch (error: any) {
    console.error('Error in POST /api/semesters:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
