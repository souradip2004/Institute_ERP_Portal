// app/api/section-course-teacher-relations/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/config/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const relation = await prisma.sectionCourseTeacherRelation.findUnique({
      where: { id },
      include: {
        classSection: true,
        course: true,
        teacher: true,
      },
    });

    if (!relation) {
      return NextResponse.json({ error: 'Relation not found' }, { status: 404 });
    }

    return NextResponse.json(relation, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch relation' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { classSectionId, courseId, teacherId } = body;

    if (!classSectionId || !courseId || !teacherId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const relation = await prisma.sectionCourseTeacherRelation.update({
      where: { id },
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

    return NextResponse.json(relation, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update relation' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.sectionCourseTeacherRelation.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Relation deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete relation' }, { status: 500 });
  }
}