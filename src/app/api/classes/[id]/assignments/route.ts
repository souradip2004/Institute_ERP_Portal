import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id;

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }
const response=await prisma.assignment.findMany({
      where: { classSectionId: classId },
      include: {
        classSection: {
          include: {
            batch: true,
            semester: true,
            studentEnrollments: {
              include: {
                student: {
                  include: {
                    user: {
                      select: { id: true, name: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
        createdBy: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
    console.log(response);
    // If no class ID is provided, return an error
    
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
    
    const assignments = response

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error in class assignments API route:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments data' }, { status: 500 });
  }
} 