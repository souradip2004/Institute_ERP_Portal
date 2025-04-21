import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/services/teacherService';

const teacherService = new TeacherService();

export async function GET(req: NextRequest) {
  // Extract teacherId from the URL path
  const pathParts = req.nextUrl.pathname.split('/');
  const teacherId = pathParts[pathParts.length - 2]; // Assuming 'teacherId' is the second-to-last part of the path

  // Check if the teacherId exists
  if (!teacherId) {
    return NextResponse.json({ error: 'teacherId is required' }, { status: 400 });
  }

  try {
    // Fetch teacher dashboard details using the service
    const teacherDetails = await teacherService.getTeacherDashboardDetail(teacherId);

    // Check if teacher details were found
    if (!teacherDetails) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json(teacherDetails);
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' ,message:error}, { status: 500 });
  }
}
