import prisma from '@/config/prisma';
import { examQueue } from '@/bullmq/queues/exam';
export class ExamService {
  async getAllExams() {
    return prisma.exam.findMany();
  }

  async createExam(data: any) {
    return examQueue.add('create-exam', {
      data,
    });
  }

  async getExamById(id: string) {
    return prisma.exam.findUnique({ where: { id } });
  }

  async updateExam(id: string, data: any) {
    return await examQueue.add('update-exam',{
      identity:id,
      data
    });
  }

  async deleteExam(id: string) {
    return prisma.exam.delete({ where: { id } });
  }
}
