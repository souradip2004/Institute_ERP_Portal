import { NextRequest, NextResponse } from 'next/server';
import { CourseController } from '@/controllers/courseController';

const courseController = new CourseController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Invalid Course ID' }, { status: 400 });
    }

    return await courseController.getCourseById(params.id);
  } catch (error: any) {
    console.error(`Error in GET /api/courses/${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Invalid Course ID' }, { status: 400 });
    }

    return await courseController.updateCourse(params.id, req);
  } catch (error: any) {
    console.error(`Error in PATCH /api/courses/${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Invalid Course ID' }, { status: 400 });
    }

    return await courseController.deleteCourse(params.id);
  } catch (error: any) {
    console.error(`Error in DELETE /api/courses/${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
