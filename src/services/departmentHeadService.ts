import prisma from '@/config/prisma';

export class DepartmentHeadService {
  async getAllDepartmentHeads() {
    return prisma.departmentHead.findMany();
  }

  async createDepartmentHead(data: any) {
    return prisma.departmentHead.create({ data });
  }

  async getDepartmentHeadById(id: string) {
    return prisma.departmentHead.findUnique({ where: { id } });
  }

  async updateDepartmentHead(id: string, data: any) {
    return prisma.departmentHead.update({ where: { id }, data });
  }

  async deleteDepartmentHead(id: string) {
    return prisma.departmentHead.delete({ where: { id } });
  }
}
