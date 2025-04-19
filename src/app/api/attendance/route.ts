import { NextRequest} from 'next/server';
import { AttendanceController } from '@/controllers/attendanceController';

const controller = new AttendanceController();

export async function POST(req: NextRequest) {
  return controller.createAttendance(req);
}

export async function GET(req: NextRequest) {
  // Check if the request is for course attendance statistics
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const courseId = searchParams.get('courseId');
  
  if (studentId && courseId) {
    return controller.getStudentCourseAttendance(req, studentId, courseId);
  }
  
  // Otherwise, use the original get method for attendance records
  return controller.getAttendanceRecords(req);
}