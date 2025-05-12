import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/services/teacherService';
import { TeacherDashboardService } from '@/services/teacherDashboardService';


const teacherService = new TeacherService();
const teacherDashboardService = new TeacherDashboardService();

export async function GET(req: NextRequest) {
  // Extract teacherId from the URL path
  const pathParts = req.nextUrl.pathname.split('/');
  const teacherId = pathParts[pathParts.length - 2]; // Assuming 'teacherId' is the second-to-last part of the path

  // Check if the teacherId exists
  if (!teacherId) {
    return NextResponse.json({ error: 'teacherId is required' }, { status: 400 });
  }
  try {
    // Fetch teacher sections using the service
      // const teacherSections = await teacherDashboardService.getAllSectionByTeacherId(teacherId);
      // const teacherExam = await teacherDashboardService.getExamsByTeacherId(teacherId);
      // const teacherAssignments = await teacherDashboardService.getAllAssignmentByTeacherId(teacherId);
      // const attendance = await teacherService.getAttendanceForEachSectionByTeacherId(teacherId);

    // // Check if teacher details were found
    // if (!teacherSections || !teacherExam || !teacherAssignments || !attendance) {
    //   return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    // }



    // return NextResponse.json({ teacherSections, teacherExam, teacherAssignments, attendance:[] }, { status: 200 });


    const dashboardData = await teacherDashboardService.getDashboardData(teacherId);
    return NextResponse.json(dashboardData)
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' ,message:error}, { status: 500 });
  }
}