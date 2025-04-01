// src/services/classSectionService.ts
import prisma from '@/config/prisma';
import { classSectionQueue } from '@/bullmq/queues/classSection';
export class ClassSectionService {
  async getAllClassSections() {
    return await prisma.classSection.findMany();
  }
async createClassSection(data: any) {
  console.log('try to Create class section:', data);

  // Hardcoded data to be used if necessary
  const hardcodedData = {
    sectionName: "ECEA",
    batchId: "cm8vrfoge0003xz8f3s0d9zl9",
    courseId: "cm8y67lem0015xz78ye5i3zam",
    semesterId: "cm8y6iptp001oxz78kgncnldc",
    teacherId: "cm8y2odeq000bxz78qlvergnf",
    maxStudents: 60
  };

  // Check for missing attributes in the `data` and fill them with hardcoded values
  const classData = {
    sectionName: data.sectionName || hardcodedData.sectionName,
    batchId: data.batchId || hardcodedData.batchId,
    courseId: data.courseId || hardcodedData.courseId,
    semesterId: data.semesterId || hardcodedData.semesterId,
    teacherId: data.teacherId || hardcodedData.teacherId,
    maxStudents: data.maxStudents || hardcodedData.maxStudents
  };

  // You can add the data to the queue if necessary
  // return await classSectionQueue.add('create-section', {
  //   data,
  // });

  // Use Prisma to create the class section with the final data
  return await prisma.classSection.create({
    data:classData,
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
