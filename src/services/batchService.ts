import prisma from '@/config/prisma';
import { Batch } from '@prisma/client';

export interface CreateBatchDTO {
  batchName: string;
  year: number;
  departmentId: string;
  maxStudents?: number;
}

export interface UpdateBatchDTO {
  batchName?: string;
  year?: number;
  maxStudents?: number;
}

export interface BatchFilter {
  departmentId?: string;
}

export class BatchService {
  async getAllBatches(filters: BatchFilter = {}): Promise<Batch[]> {
    const { departmentId } = filters;
    return prisma.batch.findMany({
      where: { departmentId },
      include: {
        department: { select: { id: true, name: true, code: true } },
        students: { select: { id: true, studentRoll: true, user: { select: { name: true } } } },
        classSections: { select: { id: true, sectionName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBatch(data: CreateBatchDTO): Promise<Batch> {
    const { batchName, year, departmentId, maxStudents = 0 } = data;

    // Validate required fields
    if (!batchName || !year || !departmentId) {
      throw new Error('batchName, year, and departmentId are required');
    }

    // Uncomment for Redis/BullMQ integration
    // return await batchQueue.add('create-batch', { data });

    return prisma.batch.create({
      data: {
        batchName,
        year,
        departmentId,
        maxStudents,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getBatchById(id: string): Promise<Batch | null> {
    if (!id) throw new Error('Batch ID is required');

    return prisma.batch.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true, code: true } },
        students: { select: { id: true, studentRoll: true, user: { select: { name: true } } } },
        classSections: { select: { id: true, sectionName: true } },
      },
    });
  }

  async updateBatch(id: string, data: UpdateBatchDTO): Promise<Batch> {
    if (!id) throw new Error('Batch ID is required');

    const { batchName, year, maxStudents } = data;

    // Check if batch exists
    const existingBatch = await prisma.batch.findUnique({ where: { id } });
    if (!existingBatch) throw new Error('Batch not found');

    // Uncomment for Redis/BullMQ integration
    // return await batchQueue.add('update-batch', { identity: id, data });

    return prisma.batch.update({
      where: { id },
      data: {
        batchName,
        year,
        maxStudents,
        updatedAt: new Date(),
      },
    });
  }

  async deleteBatch(id: string): Promise<void> {
    if (!id) throw new Error('Batch ID is required');

    const existingBatch = await prisma.batch.findUnique({ where: { id } });
    if (!existingBatch) throw new Error('Batch not found');

    // Uncomment for Redis/BullMQ integration
    // await batchQueue.add('delete-batch', { identity: id });

    await prisma.batch.delete({ where: { id } });
  }
}