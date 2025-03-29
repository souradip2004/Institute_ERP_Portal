import prisma from '@/config/prisma';

export class ExamService {
  async getAllExams() {
    return prisma.exam.findMany();
  }

  async createExam(data: any) {
    return prisma.exam.create({ data });
  }

  async getExamById(id: string) {
    return prisma.exam.findUnique({ where: { id } });
  }

  async updateExam(id: string, data: any) {
    return prisma.exam.update({ where: { id }, data });
  }

  async deleteExam(id: string) {
    return prisma.exam.delete({ where: { id } });
  }
}
