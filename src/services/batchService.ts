import prisma from '@/config/prisma';
import { batchQueue } from '@/bullmq/queues/Batch';
export class BatchService {
  async getAllBatches() {
    return await prisma.batch.findMany();
  }

  async createBatch(data: any) {
    console.log('Creating batch:', data);
    // return await batchQueue.add('create-batch', {
    //   data,
    //   });

    return await prisma.batch.create({
      data: data,
    });
  }

  async getBatchById(id: string) {
    return await prisma.batch.findUnique({ where: { id } });
  }

  async updateBatch(id: string, data: any) {
    return await batchQueue.add('update-batch',{
      data,
      identity:id
    })
  }

  async deleteBatch(id: string) {
    return await batchQueue.add('delete-batch',{
identity:id      
    });
  }
}
