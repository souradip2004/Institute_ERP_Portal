import { NextRequest, NextResponse } from 'next/server';
import { CourseController } from '@/controllers/courseController';

const courseController = new CourseController();

export async function GET(req: NextRequest) {
  try {
    return await courseController.getAllCourses();
  } catch (error: any) {
    console.error('Error in GET /api/courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await courseController.createCourse(req);
  } catch (error: any) {
    console.error('Error in POST /api/courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
