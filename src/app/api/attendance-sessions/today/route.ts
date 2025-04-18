// File: app/api/attendance-sessions/today/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TodayAttendanceController } from '@/controllers/TodayAttendanceController';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
  }

  try {
    const controller = new TodayAttendanceController();
    const sessions = await controller.getStudentTodaySessions(studentId, date);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching today\'s sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}