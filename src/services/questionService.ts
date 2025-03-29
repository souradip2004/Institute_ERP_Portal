import prisma from '@/config/prisma';
import { questionQueue } from '@/bullmq/queues/question';
export class QuestionService {
  async getAllQuestions() {
    return prisma.question.findMany();
  }

  async createQuestion(data: any) {
    return questionQueue.add('create-question', {
      data,
    });
  }

  async getQuestionById(id: string) {
    return prisma.question.findUnique({ where: { id } });
  }

  async updateQuestion(id: string, data: any) {
    return questionQueue.add('update-question', {
      identity: id,
      data,
    });
  }

  async deleteQuestion(id: string) {
    return questionQueue.add('delete-question', {
      identity: id,
    });
  }
}
