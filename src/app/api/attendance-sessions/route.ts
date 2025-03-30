import { NextRequest } from 'next/server';
import { AttendanceSessionController } from '@/controllers/attendanceSessionsController';

const attendanceSessionController = new AttendanceSessionController();

export async function POST(req: NextRequest) {
  //console.log('POST request to /api/attendance-sessions',  req.body);  
  return attendanceSessionController.createAttendanceSession(req);
}

export async function GET(req: NextRequest) {
  return attendanceSessionController.getAttendanceSessions(req);
}