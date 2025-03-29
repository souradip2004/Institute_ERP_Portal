import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/services/courseService';

const courseService = new CourseService();

export class CourseController {
  async getAllCourses() {
    try {
      const courses = await courseService.getAllCourses();
      return NextResponse.json(courses);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async createCourse(req: NextRequest) {
    try {
      const data = await req.json();
      const course = await courseService.createCourse(data);
      return NextResponse.json(course, { status: 201 });
    } catch (error: any) {
      console.error('Error creating course:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async getCourseById(courseId: string) {
    try {
      if (!courseId) {
        return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
      }

      const course = await courseService.getCourseById(courseId);
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      return NextResponse.json(course);
    } catch (error: any) {
      console.error('Error fetching course by ID:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async updateCourse(courseId: string, req: NextRequest) {
    try {
      if (!courseId) {
        return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
      }

      const data = await req.json();
      const course = await courseService.updateCourse(courseId, data);
      return NextResponse.json(course);
    } catch (error: any) {
      console.error('Error updating course:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async deleteCourse(courseId: string) {
    try {
      if (!courseId) {
        return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
      }

      await courseService.deleteCourse(courseId);
      return NextResponse.json({ message: 'Course deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting course:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}
