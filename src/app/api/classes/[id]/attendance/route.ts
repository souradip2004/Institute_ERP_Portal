import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id;

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    console.log(`Fetching attendance for class ID: ${classId}`);

    // In a real implementation, this would query your database
    // For now, we'll return mock data with attendance percentage
    const attendanceData = {
      classId,
      percentage: Math.floor(Math.random() * 30) + 65, // Random percentage between 65-95%
      totalStudents: 35,
      presentCount: 28,
      absentCount: 7,
      summary: {
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        date: new Date().toLocaleDateString('en-US'),
        percentage: 80
      }
    };

    return NextResponse.json(attendanceData);
  } catch (error) {
    console.error('Error in class attendance API route:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance data' }, { status: 500 });
  }
} 