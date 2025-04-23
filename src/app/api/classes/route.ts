import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ error: 'teacherId is required' }, { status: 400 });
    }

    console.log(`Fetching classes for teacher ID: ${teacherId}`);

    // In a real implementation, this would query your database
    // For now, we'll return mock data that matches your expected format
    const classes = [
      {
        id: 'class1',
        className: 'Class 9th',
        sectionName: 'A',
        subject: 'Mathematics',
        studentCount: 35,
        attendancePercentage: 78,
        lastAssignment: {
          title: "Algebra Set 3",
          daysAgo: 1
        },
        nextExam: {
          date: "Apr 12",
          day: "(Monday)"
        }
      },
      {
        id: 'class2',
        className: 'Class 10th',
        sectionName: 'B',
        subject: 'Physics',
        studentCount: 38,
        attendancePercentage: 82,
        lastAssignment: {
          title: "Newton's Laws",
          daysAgo: 2
        },
        nextExam: {
          date: "Apr 15",
          day: "(Thursday)"
        }
      },
      {
        id: 'class3',
        className: 'Class 11th',
        sectionName: 'A',
        subject: 'Biology',
        studentCount: 32,
        attendancePercentage: 75,
        lastAssignment: {
          title: "Cell Structure",
          daysAgo: 3
        },
        nextExam: {
          date: "Apr 18",
          day: "(Sunday)"
        }
      }
    ];

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error in classes API route:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
} 