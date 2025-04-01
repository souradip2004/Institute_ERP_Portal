import prisma from '@/config/prisma';
import { Course, CourseType } from '@prisma/client';

export interface CreateCourseDTO {
  courseCode: string;
  name: string;
  description?: string | null;
  creditHours?: number;
  courseType: CourseType;
  departmentId: string;
  createdById: string;
}

export interface UpdateCourseDTO {
  courseCode?: string;
  name?: string;
  description?: string | null;
  creditHours?: number;
  courseType?: CourseType;
}

export interface CourseFilter {
  departmentId?: string;
  institutionId?: string;
}

export class CourseService {
  async getAllCourses(filters: CourseFilter = {}): Promise<Course[]> {
    const { departmentId, institutionId } = filters;
    return prisma.course.findMany({
      where: {
        departmentId,
        department: institutionId ? { institutionId } : undefined,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, teacherCode: true, user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCourse(data: CreateCourseDTO): Promise<Course> {
    const { courseCode, name, description, creditHours = 0, courseType, departmentId, createdById } = data;

    // Validate required fields
    if (!courseCode || !name || !courseType || !departmentId || !createdById) {
      throw new Error('courseCode, name, courseType, departmentId, and createdById are required');
    }

    // Check for unique courseCode
    const existingCourse = await prisma.course.findUnique({ where: { courseCode } });
    if (existingCourse) {
      throw new Error('Course code already exists');
    }

    // Uncomment for Redis/BullMQ integration
    // return await courseQueue.add('create-course', { data });

    return prisma.course.create({
      data: {
        courseCode,
        name,
        description,
        creditHours,
        courseType,
        departmentId,
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getCourseById(id: string): Promise<Course | null> {
    if (!id) throw new Error('Course ID is required');

    return prisma.course.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, teacherCode: true, user: { select: { name: true } } } },
        classSections: { select: { id: true, sectionName: true } },
        aiVideoContents: { select: { id: true, title: true } },
        aiQuestionBanks: { select: { id: true, title: true } },
      },
    });
  }

  async updateCourse(id: string, data: UpdateCourseDTO): Promise<Course> {
    if (!id) throw new Error('Course ID is required');

    const { courseCode, name, description, creditHours, courseType } = data;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({ where: { id } });
    if (!existingCourse) throw new Error('Course not found');

    // If courseCode is being updated, check uniqueness
    if (courseCode && courseCode !== existingCourse.courseCode) {
      const duplicateCode = await prisma.course.findUnique({ where: { courseCode } });
      if (duplicateCode) throw new Error('Course code already exists');
    }

    // Uncomment for Redis/BullMQ integration
    // return await courseQueue.add('update-course', { identity: id, data });

    return prisma.course.update({
      where: { id },
      data: {
        courseCode,
        name,
        description,
        creditHours,
        courseType,
        updatedAt: new Date(),
      },
    });
  }

  async deleteCourse(id: string): Promise<void> {
    if (!id) throw new Error('Course ID is required');

    const existingCourse = await prisma.course.findUnique({ where: { id } });
    if (!existingCourse) throw new Error('Course not found');

    // Uncomment for Redis/BullMQ integration
    // await courseQueue.add('delete-course', { identity: id });

    await prisma.course.delete({ where: { id } });
  }
}