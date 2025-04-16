import { NextResponse } from 'next/server';
import prisma from '@/config/prisma';

export async function GET() {
  try {

    const relations = await prisma.sectionCourseTeacherRelation.findMany({
      include: {
        classSection: true,
        course: true,
        teacher: true,
      },
    });
    return NextResponse.json(relations, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch relations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classSectionId, courseId, teacherId } = body;

    if (!classSectionId || !courseId || !teacherId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const relation = await prisma.sectionCourseTeacherRelation.create({
      data: {
        classSectionId,
        courseId,
        teacherId,
      },
      include: {
        classSection: true,
        course: true,
        teacher: true,
      },
    });

    return NextResponse.json(relation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create relation' }, { status: 500 });
  }
}
