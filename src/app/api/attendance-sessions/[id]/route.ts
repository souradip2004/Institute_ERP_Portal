import { NextRequest} from 'next/server';
import { AttendanceSessionController } from '@/controllers/attendanceSessionsController';

const controller = new AttendanceSessionController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return controller.getAttendanceSessionById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return controller.updateAttendanceSession(params.id, req);
}