import { NextRequest } from 'next/server';
import { AttendanceSessionController } from '@/controllers/attendanceSessionsController';

const attendanceSessionController = new AttendanceSessionController();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return attendanceSessionController.getAttendanceSessionById(params.id);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return attendanceSessionController.updateAttendanceSession(params.id, req);
}