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

    console.log(`Fetching students for class ID: ${classId}`);

    // In a real implementation, this would query your database
    // For now, we'll return mock data
    const students = [];
    
    // Generate 25 sample students
    for (let i = 1; i <= 25; i++) {
      students.push({
        id: `student${i}`,
        name: `Student ${i}`,
        rollNo: `R${i.toString().padStart(3, '0')}`,
        user: {
          name: `Student ${i}`,
          email: `student${i}@example.com`
        },
        attendancePercentage: Math.floor(Math.random() * 30) + 60, // 60-90%
        status: Math.random() > 0.2 ? 'PRESENT' : 'ABSENT'
      });
    }

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error in class students API route:', error);
    return NextResponse.json({ error: 'Failed to fetch students data' }, { status: 500 });
  }
} 