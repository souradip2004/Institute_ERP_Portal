import prisma from '@/config/prisma';

export class ExamSubmissionService {
  async getAllExamSubmissions() {
    return prisma.examSubmission.findMany();
  }

  async createExamSubmission(data: any) {
    return prisma.examSubmission.create({ data });
  }

  async getExamSubmissionById(id: string) {
    return prisma.examSubmission.findUnique({ where: { id } });
  }

  async updateExamSubmission(id: string, data: any) {
    return prisma.examSubmission.update({ where: { id }, data });
  }

  async deleteExamSubmission(id: string) {
    return prisma.examSubmission.delete({ where: { id } });
  }
}
