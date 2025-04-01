import { NextRequest} from 'next/server';
import { CourseController } from '@/controllers/courseController';

const courseController = new CourseController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return courseController.getCourseById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return courseController.updateCourse(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return courseController.deleteCourse(params.id);
}