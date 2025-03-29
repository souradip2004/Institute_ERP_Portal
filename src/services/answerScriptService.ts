import prisma from '@/config/prisma';
import {ascriptQueue} from '@/bullmq/queues/answerScript';
export class AnswerScriptService {
  async getAllAnswerScripts() {
    return prisma.answerScript.findMany();
  }

  async createAnswerScript(data: any) {
    return ascriptQueue.add('create-ascript', {
      data,
    });
  }

  async getAnswerScriptById(id: string) {
    return prisma.answerScript.findUnique({ where: { id } });
  }

  async updateAnswerScript(id: string, data: any) {
    return ascriptQueue.add('update-ascript', {
      identity: id,
      data,
    });
  }

  async deleteAnswerScript(id: string) {
    return ascriptQueue.add('delete-ascript', {
      identity: id,
    });
  }
}
