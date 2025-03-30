// src/app/api/attendance/[id]/route.ts
import { NextRequest } from 'next/server';
import { AttendanceController } from '@/controllers/attendanceController';

const attendanceController = new AttendanceController();

/**
 * PUT /api/attendance/:id
 * Update an attendance record (teacher or dept head)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return attendanceController.updateAttendance(params.id, req);
}