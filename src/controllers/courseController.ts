import { NextRequest, NextResponse } from 'next/server';
import { CourseService, CreateCourseDTO, UpdateCourseDTO, CourseFilter } from '@/services/courseService';

const courseService = new CourseService();

export class CourseController {
  async getAllCourses(req: NextRequest) {
    try {
      const url = new URL(req.url);
      const departmentId = url.searchParams.get('departmentId') || undefined;
      const institutionId = url.searchParams.get('institutionId') || undefined;
      const filters: CourseFilter = { departmentId, institutionId };

      const courses = await courseService.getAllCourses(filters);
      return NextResponse.json(courses);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching courses:', error.message);
      } else {
        console.error('Error fetching courses:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching courses' }, { status: 500 });
    }
  }

  async createCourse(req: NextRequest) {
    try {
      const data = await req.json();
      const { courseCode, name, description, creditHours, courseType, departmentId, createdById } = data;

      if (!departmentId || !createdById) {
        return NextResponse.json({ error: 'departmentId and createdById are required' }, { status: 400 });
      }

      const createData: CreateCourseDTO = {
        courseCode,
        name,
        description,
        creditHours,
        courseType,
        departmentId,
        createdById,
      };
      const course = await courseService.createCourse(createData);
      return NextResponse.json(course, { status: 201 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error creating course:', error.message);
      } else {
        console.error('Error creating course:', error);
      }
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message || 'An error occurred while creating the course' }, { status: error.message.includes('already exists') ? 409 : 500 });
      } else {
        return NextResponse.json({ error: 'An error occurred while creating the course' }, { status: 500 });
      }
    }
  }

  async getCourseById(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });

      const course = await courseService.getCourseById(id);
      if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

      return NextResponse.json(course);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error fetching course ${id}:`, error.message);
      } else {
        console.error(`Error fetching course ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching the course' }, { status: 500 });
    }
  }

  async updateCourse(id: string, req: NextRequest) {
    try {
      if (!id) return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });

      const data = await req.json();
      const updateData: UpdateCourseDTO = {
        courseCode: data.courseCode,
        name: data.name,
        description: data.description,
        creditHours: data.creditHours,
        courseType: data.courseType,
      };

      const updatedCourse = await courseService.updateCourse(id, updateData);
      return NextResponse.json(updatedCourse);
    } catch (error:unknown) {
      if (error instanceof Error) {
        console.error(`Error updating course ${id}:`, error.message);
      } else {
        console.error(`Error updating course ${id}:`, error);
      }
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message || 'An error occurred while updating the course' }, { status: error.message.includes('already exists') ? 409 : 500 });
      } else {
        return NextResponse.json({ error: 'An error occurred while updating the course' }, { status: 500 });
      }
    }
  }

  async deleteCourse(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });

      await courseService.deleteCourse(id);
      return NextResponse.json({ message: 'Course deleted successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error deleting course ${id}:`, error.message);
      } else {
        console.error(`Error deleting course ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while deleting the course' }, { status: 500 });
    }
  }

   async getCoursesByDepartment(departmentId: string) {
        return courseService.fetchCoursesByDepartment(departmentId);
    }
}