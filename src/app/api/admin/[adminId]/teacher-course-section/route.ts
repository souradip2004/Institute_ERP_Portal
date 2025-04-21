import { NextResponse } from 'next/server';
import {
  createTeacherCourseSectionAndSessions,
  getTeachers,
  getCourses,
  getClassSections,
} from '@/services/teacherCourseSectionService';

export async function POST(request: Request, { params }: { params: { adminId: string } }) {
  try {
    const { adminId } = params;
    const body = await request.json();
    const { teacherId, courseId, classSectionId, semesterId, days, startTime, endTime } = body;

    const result = await createTeacherCourseSectionAndSessions({
      teacherId,
      courseId,
      classSectionId,
      semesterId,
      days,
      startTime,
      endTime,
      adminId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { adminId: string } }) {
  const { adminId } = params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (!adminId) {
    return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
  }

  try {
    switch (type) {
      case 'teachers':
        const teachers = await getTeachers(adminId);
        return NextResponse.json(teachers);
      case 'courses':
        const courses = await getCourses(adminId);
        return NextResponse.json(courses);
      case 'class-sections':
        const classSections = await getClassSections(adminId);
        return NextResponse.json(classSections);
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}