// src/app/api/attendance/route.ts
import { NextRequest } from 'next/server';
import { AttendanceController } from '@/controllers/attendanceController';

const attendanceController = new AttendanceController();

/**
 * POST /api/attendance
 * Record attendance for a session (teacher)
 */
export async function POST(req: NextRequest) {
  return attendanceController.createAttendance(req);
}

/**
 * GET /api/attendance
 * Get attendance records (filtered by session, student, or class)
 */
export async function GET(req: NextRequest) {
  return attendanceController.getAttendanceRecords(req);
}