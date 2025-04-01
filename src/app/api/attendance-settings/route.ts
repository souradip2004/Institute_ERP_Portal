import { NextRequest} from 'next/server';
import { AttendanceSettingsController } from '@/controllers/attendanceSettingsController';

const controller = new AttendanceSettingsController();

export async function GET(req: NextRequest) {
  return controller.getAttendanceSettings(req);
}

export async function POST(req: NextRequest) {
  return controller.createAttendanceSettings(req);
}

export async function PUT(req: NextRequest) {
  return controller.updateAttendanceSettings(req);
}