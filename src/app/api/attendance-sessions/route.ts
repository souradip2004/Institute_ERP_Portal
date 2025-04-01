import { NextRequest} from 'next/server';
import { AttendanceSessionController } from '@/controllers/attendanceSessionsController';

const controller = new AttendanceSessionController();

export async function POST(req: NextRequest) {
  return controller.createAttendanceSession(req);
}

export async function GET(req: NextRequest) {
  return controller.getAttendanceSessions(req);
}