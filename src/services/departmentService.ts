// services/departmentService.ts
import prisma from '@/config/prisma';

export class DepartmentService {
  async getAllDepartments() {
    return await prisma.department.findMany({ include: { institution: true } });
  }

  async createDepartment(data: any) {
    const { name, code, description, institutionId } = data;
    return await prisma.department.create({
      data: { name, code, description, institutionId },
    });
  }

  async getDepartmentById(id: string) {
    return await prisma.department.findUnique({
      where: { id },
      include: { institution: true },
    });
  }

  async updateDepartment(id: string, data: any) {
    const { name, code, description } = data;
    return await prisma.department.update({
      where: { id },
      data: { name, code, description },
    });
  }

  async deleteDepartment(id: string) {
    return await prisma.department.delete({ where: { id } });
  }
}