import { NextRequest} from 'next/server';
import { AttendanceController } from '@/controllers/attendanceController';

const controller = new AttendanceController();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return controller.updateAttendance(params.id, req);
}