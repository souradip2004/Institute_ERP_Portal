import prisma from '@/config/prisma';
import { ClassSection } from '@prisma/client';

export interface CreateClassSectionDTO {
  sectionName: string;
  batchId: string;
  courseId: string;
  semesterId: string;
  teacherId: string;
  maxStudents?: number;
}

export interface UpdateClassSectionDTO {
  sectionName?: string;
  batchId?: string;
  courseId?: string;
  semesterId?: string;
  teacherId?: string;
  maxStudents?: number;
}

export interface ClassSectionFilter {
  batchId?: string;
  courseId?: string;
}

export class ClassSectionService {
  async getAllClassSections(filters: ClassSectionFilter = {}): Promise<ClassSection[]> {
    const { batchId, courseId } = filters;
    return prisma.classSection.findMany({
      where: {
        batchId,
        courseId,
      },
      include: {
        batch: { select: { id: true, batchName: true, year: true } },
        course: { select: { id: true, courseCode: true, name: true } },
        semester: { select: { id: true, name: true, startDate: true, endDate: true } },
        teacher: { select: { id: true, teacherCode: true, user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createClassSection(data: CreateClassSectionDTO): Promise<ClassSection> {
    const { sectionName, batchId, courseId, semesterId, teacherId, maxStudents = 0 } = data;

    // Validate required fields
    if (!sectionName || !batchId || !courseId || !semesterId || !teacherId) {
      throw new Error('sectionName, batchId, courseId, semesterId, and teacherId are required');
    }

    // Uncomment for Redis/BullMQ integration
    // return await classSectionQueue.add('create-section', { data });

    return prisma.classSection.create({
      data: {
        sectionName,
        batchId,
        courseId,
        semesterId,
        teacherId,
        maxStudents,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getClassSectionById(id: string): Promise<ClassSection | null> {
    if (!id) throw new Error('Class Section ID is required');

    return prisma.classSection.findUnique({
      where: { id },
      include: {
        batch: { select: { id: true, batchName: true, year: true } },
        course: { select: { id: true, courseCode: true, name: true } },
        semester: { select: { id: true, name: true, startDate: true, endDate: true } },
        teacher: { select: { id: true, teacherCode: true, user: { select: { name: true } } } },
        studentEnrollments: { select: { id: true, studentId: true, enrollmentStatus: true } },
        attendanceSessions: { select: { id: true, sessionDate: true, sessionType: true } },
        exams: { select: { id: true, title: true, examDate: true } },
      },
    });
  }

  async updateClassSection(id: string, data: UpdateClassSectionDTO): Promise<ClassSection> {
    if (!id) throw new Error('Class Section ID is required');

    const { sectionName, batchId, courseId, semesterId, teacherId, maxStudents } = data;

    // Check if class section exists
    const existingClassSection = await prisma.classSection.findUnique({ where: { id } });
    if (!existingClassSection) throw new Error('Class Section not found');

    // Uncomment for Redis/BullMQ integration
    // return await classSectionQueue.add('update-section', { identity: id, data });

    return prisma.classSection.update({
      where: { id },
      data: {
        sectionName,
        batchId,
        courseId,
        semesterId,
        teacherId,
        maxStudents,
        updatedAt: new Date(),
      },
    });
  }

  async deleteClassSection(id: string): Promise<void> {
    if (!id) throw new Error('Class Section ID is required');

    const existingClassSection = await prisma.classSection.findUnique({ where: { id } });
    if (!existingClassSection) throw new Error('Class Section not found');

    // Uncomment for Redis/BullMQ integration
    // await classSectionQueue.add('delete-section', { identity: id });

    await prisma.classSection.delete({ where: { id } });
  }
}
