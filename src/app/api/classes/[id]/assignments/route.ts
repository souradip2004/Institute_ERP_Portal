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

    console.log(`Fetching assignments for class ID: ${classId}`);

    // In a real implementation, this would query your database
    // For now, we'll return mock data
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const assignments = [
      {
        id: 'asg1',
        title: 'Chapter 1 Problems',
        description: 'Complete problems 1-10 from Chapter 1 of the textbook.',
        dueDate: tomorrow.toISOString(),
        createdAt: today.toISOString(),
        status: 'active',
        submissionCount: 15,
        totalStudents: 30
      },
      {
        id: 'asg2',
        title: 'Research Paper on Plate Tectonics',
        description: 'Write a 3-page research paper on continental drift and plate tectonics.',
        dueDate: nextWeek.toISOString(),
        createdAt: today.toISOString(),
        status: 'active',
        submissionCount: 8,
        totalStudents: 30,
        fileUrl: 'https://example.com/sample-assignment.pdf'
      },
      {
        id: 'asg3',
        title: 'Chapter 3 Quiz',
        description: 'Complete the online quiz covering Chapter 3 materials.',
        dueDate: lastWeek.toISOString(),
        createdAt: lastWeek.toISOString(),
        status: 'past_due',
        submissionCount: 28,
        totalStudents: 30
      }
    ];

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error in class assignments API route:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments data' }, { status: 500 });
  }
} 