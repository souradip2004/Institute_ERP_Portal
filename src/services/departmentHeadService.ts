import prisma from '@/config/prisma';
import { DheadQueue } from '@/bullmq/queues/departmentHead';
export class DepartmentHeadService {
  async getAllDepartmentHeads() {
    return prisma.departmentHead.findMany();
  }

  async createDepartmentHead(data: any) {
    return DheadQueue.add('create-dhead', {
      data,
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
