import { NextResponse } from 'next/server';
import {
  createTeacherCourseSectionAndSessions,
  getTeachers,
  getCourses,
  getClassSections,
} from '@/services/teacherCourseSectionService';

export async function POST(request: Request) {
  try {
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
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    switch (type) {
      case 'teachers':
        const teachers = await getTeachers();
        return NextResponse.json(teachers);
      case 'courses':
        const courses = await getCourses();
        return NextResponse.json(courses);
      case 'class-sections':
        const classSections = await getClassSections();
        return NextResponse.json(classSections);
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}