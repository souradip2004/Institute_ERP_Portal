import { NextRequest} from 'next/server';
import { CourseController } from '@/controllers/courseController';

const courseController = new CourseController();

export async function GET(req: NextRequest) {
  return courseController.getAllCourses(req);
}

export async function POST(req: NextRequest) {
  return courseController.createCourse(req);
}