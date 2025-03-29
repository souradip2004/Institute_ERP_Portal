import prisma from '@/config/prisma';

export class QuestionService {
  async getAllQuestions() {
    return prisma.question.findMany();
  }

  async createQuestion(data: any) {
    return prisma.question.create({ data });
  }

  async getQuestionById(id: string) {
    return prisma.question.findUnique({ where: { id } });
  }

  async updateQuestion(id: string, data: any) {
    return prisma.question.update({ where: { id }, data });
  }

  async deleteQuestion(id: string) {
    return prisma.question.delete({ where: { id } });
  }
}
