import { NextRequest} from 'next/server';
import { AttendanceController } from '@/controllers/attendanceController';

const controller = new AttendanceController();

export async function POST(req: NextRequest) {
  return controller.createAttendance(req);
}

export async function GET(req: NextRequest) {
  return controller.getAttendanceRecords(req);
}