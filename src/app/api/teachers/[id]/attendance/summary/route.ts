import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const teacherId = params.id;

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    console.log(`Fetching attendance summary for teacher ID: ${teacherId}`);

    // In a real implementation, this would query your database
    // For now, we'll return mock data with attendance percentage
    const attendanceSummary = {
      teacherId,
      percentage: 93, // Teacher attendance is usually high
      attendancePercentage: 93, // Alternative property name for compatibility
      daysPresent: 42,
      daysAbsent: 3,
      summary: {
        currentMonth: {
          percentage: 95,
          daysPresent: 19,
          daysAbsent: 1
        },
        previousMonth: {
          percentage: 90,
          daysPresent: 18,
          daysAbsent: 2
        }
      }
    };

    return NextResponse.json(attendanceSummary);
  } catch (error) {
    console.error('Error in teacher attendance summary API route:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance summary' }, { status: 500 });
  }
} 