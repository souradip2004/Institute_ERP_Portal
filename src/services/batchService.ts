import prisma from '@/config/prisma';

export class BatchService {
  async getAllBatches() {
    return await prisma.batch.findMany();
  }

  async createBatch(data: any) {
    return await prisma.batch.create({ data });
  }

  async getBatchById(id: string) {
    return await prisma.batch.findUnique({ where: { id } });
  }

  async updateBatch(id: string, data: any) {
    return await prisma.batch.update({ where: { id }, data });
  }

  async deleteBatch(id: string) {
    return await prisma.batch.delete({ where: { id } });
  }
}
