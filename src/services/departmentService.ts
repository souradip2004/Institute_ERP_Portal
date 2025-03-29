// services/departmentService.ts
import prisma from '@/config/prisma';
import { DepartmentQueue } from '@/bullmq/queues/Department';
export class DepartmentService {
  async getAllDepartments() {
    return await prisma.department.findMany({ include: { institution: true } });
  }

  async createDepartment(data: any) {
    return await DepartmentQueue.add('create-department', {
      data,
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
    return await DepartmentQueue.add('update-department',{
      identity:id,
      data:data
    })
  }

  async deleteDepartment(id: string) {
    return await DepartmentQueue.add('delete-department',{
      identity:id,
    })  }
}