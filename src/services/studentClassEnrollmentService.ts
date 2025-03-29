import prisma from '@/config/prisma';

export class StudentClassEnrollmentService {
  async getAllEnrollments() {
    return prisma.studentClassEnrollment.findMany();
  }

  async createEnrollment(data: any) {
    return prisma.studentClassEnrollment.create({ data });
  }

  async getEnrollmentById(id: string) {
    return prisma.studentClassEnrollment.findUnique({ where: { id } });
  }

  async updateEnrollment(id: string, data: any) {
    return prisma.studentClassEnrollment.update({ where: { id }, data });
  }

  async deleteEnrollment(id: string) {
    return prisma.studentClassEnrollment.delete({ where: { id } });
  }
}
