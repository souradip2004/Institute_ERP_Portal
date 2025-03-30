import { NextRequest} from 'next/server';
import { AttendanceSettingsController } from '@/controllers/attendanceSettingsController';

const attendanceSettingsController = new AttendanceSettingsController();

export async function GET(req: NextRequest) {
  return attendanceSettingsController.getAttendanceSettings(req);
}

export async function POST(req: NextRequest) {
  return attendanceSettingsController.createAttendanceSettings(req);
}

export async function PUT(req: NextRequest) {
  return attendanceSettingsController.updateAttendanceSettings(req);
}