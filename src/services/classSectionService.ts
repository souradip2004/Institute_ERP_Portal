// src/services/classSectionService.ts
import prisma from '@/config/prisma';
import { classSectionQueue } from '@/bullmq/queues/classSection';
export class ClassSectionService {
  async getAllClassSections() {
    return await prisma.classSection.findMany();
  }

  async createClassSection(data: any) {
    console.log('Creating class section:', data);

    return await classSectionQueue.add('create-section', {
      data,
    });
  }

  async getClassSectionById(id: string) {
    return await prisma.classSection.findUnique({ where: { id } });
  }

  async updateClassSection(id: string, data: any) {
    return await classSectionQueue.add('update-section',{
      identity:id,
      data:data
    });
  }

  async deleteClassSection(id: string) {
    return await classSectionQueue.add('delete-section',{
      identity:id
    })
  }
}
