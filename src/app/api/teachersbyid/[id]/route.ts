import { NextRequest } from 'next/server';
import { TeacherController } from '@/controllers/teacherController';

const teacherController = new TeacherController();

export async function GET(req: NextRequest, context: { params: { id: string } }) {
    const { params } = context;
    return teacherController.getTeacherByuserId(params.id);
}
