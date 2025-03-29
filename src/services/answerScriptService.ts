import prisma from '@/config/prisma';

export class AnswerScriptService {
  async getAllAnswerScripts() {
    return prisma.answerScript.findMany();
  }

  async createAnswerScript(data: any) {
    return prisma.answerScript.create({ data });
  }

  async getAnswerScriptById(id: string) {
    return prisma.answerScript.findUnique({ where: { id } });
  }

  async updateAnswerScript(id: string, data: any) {
    return prisma.answerScript.update({ where: { id }, data });
  }

  async deleteAnswerScript(id: string) {
    return prisma.answerScript.delete({ where: { id } });
  }
}
