import prisma from '@/config/prisma';
import { enrollQueue } from '@/bullmq/queues/studentEnroll';
export class StudentClassEnrollmentService {
  async getAllEnrollments() {
    return prisma.studentClassEnrollment.findMany();
  }

  async createEnrollment(data: any) {
    return enrollQueue.add('create-enrollment', {
      data,
    });
  }

  async getEnrollmentById(id: string) {
    return prisma.studentClassEnrollment.findUnique({ where: { id } });
  }

  async updateEnrollment(id: string, data: any) {
    return enrollQueue.add('update-enrollment', {
      identity: id,
      data,
    });
  }

  async deleteEnrollment(id: string) {
    return enrollQueue.add('delete-enrollment', {
      identity: id,
    });
  }
}
