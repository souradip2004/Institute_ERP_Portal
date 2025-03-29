// src/services/classSectionService.ts
import prisma from '@/config/prisma';

export class ClassSectionService {
  async getAllClassSections() {
    return await prisma.classSection.findMany();
  }

  async createClassSection(data: any) {
    console.log('hello from class section service');
    return await prisma.classSection.create({ data });
  }

  async getClassSectionById(id: string) {
    return await prisma.classSection.findUnique({ where: { id } });
  }

  async updateClassSection(id: string, data: any) {
    return await prisma.classSection.update({ where: { id }, data });
  }

  async deleteClassSection(id: string) {
    return await prisma.classSection.delete({ where: { id } });
  }
}
