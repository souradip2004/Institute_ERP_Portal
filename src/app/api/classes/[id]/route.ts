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

    console.log(`Fetching details for class ID: ${classId}`);

    // In a real implementation, this would query your database
    // For now, we'll return mock data based on the class ID
    let classData;
    
    // Use different mock data based on classId to simulate different classes
    if (classId === 'class1') {
      classData = {
        id: 'class1',
        name: 'Class 9th',
        className: 'Class 9th',
        section: 'A',
        sectionName: 'A',
        subject: 'Mathematics',
        studentCount: 35,
        attendancePercentage: 78
      };
    } else if (classId === 'class2') {
      classData = {
        id: 'class2',
        name: 'Class 10th',
        className: 'Class 10th',
        section: 'B',
        sectionName: 'B',
        subject: 'Physics',
        studentCount: 38,
        attendancePercentage: 82
      };
    } else if (classId === 'class3') {
      classData = {
        id: 'class3',
        name: 'Class 11th',
        className: 'Class 11th',
        section: 'A',
        sectionName: 'A',
        subject: 'Biology',
        studentCount: 32,
        attendancePercentage: 75
      };
    } else {
      // Default data for any other class ID
      classData = {
        id: classId,
        name: 'Class 9th',
        className: 'Class 9th',
        section: 'A',
        sectionName: 'A',
        subject: 'General Studies',
        studentCount: 30,
        attendancePercentage: 80
      };
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error in class details API route:', error);
    return NextResponse.json({ error: 'Failed to fetch class details' }, { status: 500 });
  }
} 