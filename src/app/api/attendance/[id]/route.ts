import {NextRequest} from 'next/server';
import {AttendanceController} from '@/controllers/attendanceController';

const controller = new AttendanceController();

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return controller.updateAttendance(params.id, req);
}