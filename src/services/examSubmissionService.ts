import prisma from '@/config/prisma';
import { examSubmitQueue } from '@/bullmq/queues/examSubmission';
export class ExamSubmissionService {
  async getAllExamSubmissions() {
    return prisma.examSubmission.findMany();
  }

  async createExamSubmission(data: any) {
    return examSubmitQueue.add('create-examSubmit', {
      data,
    });
  }

  async getExamSubmissionById(id: string) {
    return prisma.examSubmission.findUnique({ where: { id } });
  }

  async updateExamSubmission(id: string, data: any) {
    return examSubmitQueue.add('update-examSubmit', {
      identity: id,
      data,
    });
  }

  async deleteExamSubmission(id: string) {
    return examSubmitQueue.add('delete-examSubmit', {
      identity: id,
    });
  }
}
