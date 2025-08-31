// services/examService.ts
import prisma from "@/lib/prisma";
export class ExamTypeService {
  async getAllExamTypes() {
    return await prisma.examType.findMany({ include: { institution: true } });
  }

  async createExamType(data: any) {
    const { name, description, institutionId, weightage } = data;
    // return await examtypeQueue.add('create-examtype', {
    //   data
    // });

    return await prisma.examType.create({
      data: { name, description, institutionId, weightage },
    });
  }

  async getExamTypeById(id: string) {
    return await prisma.examType.findUnique({
      where: { id },
      include: { institution: true },
    });
  }

  async updateExamType(id: string, data: any) {

  }

  async deleteExamType(id: string) {

  }
}
