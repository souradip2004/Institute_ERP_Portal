import prisma from '@/config/prisma';
import { DheadQueue } from '@/bullmq/queues/departmentHead';
export class DepartmentHeadService {
  async getAllDepartmentHeads() {
    return prisma.departmentHead.findMany();
  }

async createDepartmentHead(data: any) {
  const formattedData = {
    ...data,
    appointmentDate: new Date(data.appointmentDate).toISOString(),
  };
  
  return await prisma.departmentHead.create({
    data: formattedData,
  });
}

  async getDepartmentHeadById(id: string) {
    return prisma.departmentHead.findUnique({ where: { id } });
  }

  async updateDepartmentHead(id: string, data: any) {
    return DheadQueue.add('update-dhead', {
      identity: id,
      data,
    });
  }

  async deleteDepartmentHead(id: string) {
    return DheadQueue.add('delete-dhead', {
      identity: id,
    });
  }
}
