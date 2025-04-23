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

    console.log(`Fetching notes for class ID: ${classId}`);

    // In a real implementation, this would query your database
    // For now, we'll return mock data
    const now = Date.now();
    const notes = [
      {
        id: 'note1',
        title: 'Chapter 1: Introduction to Algebra',
        content: 'This note covers the basic concepts of algebra including variables, constants, and expressions.',
        createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note2',
        title: 'Chapter 2: Linear Equations',
        content: 'This note covers solving linear equations with one variable.',
        createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        fileUrl: 'https://example.com/sample-document.pdf'
      },
      {
        id: 'note3',
        title: 'Chapter 3: Quadratic Equations',
        content: 'This note introduces quadratic equations and methods to solve them.',
        createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error in class notes API route:', error);
    return NextResponse.json({ error: 'Failed to fetch notes data' }, { status: 500 });
  }
} 