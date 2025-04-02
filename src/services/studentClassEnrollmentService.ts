import prisma from '@/config/prisma';
import { StudentClassEnrollment } from '@prisma/client';

export interface CreateEnrollmentDTO {
  studentId: string;
  classSectionId: string;
  enrollmentStatus?: 'ENROLLED' | 'DROPPED' | 'COMPLETED';
}

export interface UpdateEnrollmentDTO {
  enrollmentStatus?: 'ENROLLED' | 'DROPPED' | 'COMPLETED';
}

export class StudentClassEnrollmentService {
  async getAllEnrollments(): Promise<StudentClassEnrollment[]> {
    return prisma.studentClassEnrollment.findMany({
      include: {
        student: { select: { id: true, studentRoll: true, user: { select: { name: true } } } },
        classSection: {
          select: { id: true, sectionName: true, batch: { select: { batchName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEnrollment(data: CreateEnrollmentDTO): Promise<StudentClassEnrollment> {
    const { studentId, classSectionId, enrollmentStatus = 'ENROLLED' } = data;

    // Validate required fields
    if (!studentId || !classSectionId) {
      throw new Error('studentId and classSectionId are required');
    }

    // Uncomment for Redis/BullMQ integration
    // return await enrollQueue.add('create-enrollment', { data });

    return prisma.studentClassEnrollment.create({
      data: {
        studentId,
        classSectionId,
        enrollmentStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getEnrollmentById(id: string): Promise<StudentClassEnrollment | null> {
    if (!id) throw new Error('Enrollment ID is required');

    return prisma.studentClassEnrollment.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, studentRoll: true, user: { select: { name: true } } } },
        classSection: {
          select: { id: true, sectionName: true, batch: { select: { batchName: true } } },
        },
      },
    });
  }

  async updateEnrollment(id: string, data: UpdateEnrollmentDTO): Promise<StudentClassEnrollment> {
    if (!id) throw new Error('Enrollment ID is required');

    const { enrollmentStatus } = data;

    // Check if enrollment exists
    const existingEnrollment = await prisma.studentClassEnrollment.findUnique({ where: { id } });
    if (!existingEnrollment) throw new Error('Enrollment not found');

    // Uncomment for Redis/BullMQ integration
    // return await enrollQueue.add('update-enrollment', { identity: id, data });

    return prisma.studentClassEnrollment.update({
      where: { id },
      data: {
        enrollmentStatus,
        updatedAt: new Date(),
      },
    });
  }

  async deleteEnrollment(id: string): Promise<void> {
    if (!id) throw new Error('Enrollment ID is required');

    const existingEnrollment = await prisma.studentClassEnrollment.findUnique({ where: { id } });
    if (!existingEnrollment) throw new Error('Enrollment not found');

    // Uncomment for Redis/BullMQ integration
    // await enrollQueue.add('delete-enrollment', { identity: id });

    await prisma.studentClassEnrollment.delete({ where: { id } });
  }
}