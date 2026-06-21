import { NextRequest} from 'next/server';
import { CourseController } from '@/controllers/courseController';

const courseController = new CourseController();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return courseController.getCourseById(params.id);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return courseController.updateCourse(params.id, req);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return courseController.deleteCourse(params.id);
}