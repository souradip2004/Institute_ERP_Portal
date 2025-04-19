import prisma from "@/lib/prisma";
import { Department } from "@prisma/client";

export interface CreateDepartmentDTO {
  name: string;
  code: string;
  description?: string | null;
  institutionId: string;
}

export interface UpdateDepartmentDTO {
  name?: string;
  code?: string;
  description?: string | null;
}

export interface DepartmentFilter {
  institutionId?: string;
}

export class DepartmentService {
  async getAllDepartments(
    filters: DepartmentFilter = {}
  ): Promise<Department[]> {
    const { institutionId } = filters;
    return prisma.department.findMany({
      where: { institutionId },
      include: {
        institution: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createDepartment(data: CreateDepartmentDTO): Promise<Department> {
    const { name, code, description, institutionId } = data;

    // Validate required fields
    if (!name || !code || !institutionId) {
      throw new Error("Name, code, and institutionId are required");
    }

    // Check for unique code within institution
    const existingDepartment = await prisma.department.findUnique({
      where: { institutionId_code: { institutionId, code } },
    });
    if (existingDepartment) {
      throw new Error("Department code already exists within this institution");
    }

    // Uncomment for Redis/BullMQ integration
    // return await DepartmentQueue.add('create-department', { data });

    return prisma.department.create({
      data: {
        name,
        code,
        description,
        institutionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    if (!id) throw new Error("Department ID is required");

    return prisma.department.findUnique({
      where: { id },
      include: {
        institution: { select: { id: true, name: true } },
        teachers: {
          select: {
            id: true,
            teacherCode: true,
            user: { select: { name: true } },
          },
        },
        students: {
          select: {
            id: true,
            studentRoll: true,
            user: { select: { name: true } },
          },
        },
        courses: { select: { id: true, courseCode: true, name: true } },
      },
    });
  }

  async updateDepartment(
    id: string,
    data: UpdateDepartmentDTO
  ): Promise<Department> {
    if (!id) throw new Error("Department ID is required");

    const { name, code, description } = data;

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });
    if (!existingDepartment) throw new Error("Department not found");

    // If code is being updated, check uniqueness within institution
    if (code && code !== existingDepartment.code) {
      const duplicateCode = await prisma.department.findUnique({
        where: {
          institutionId_code: {
            institutionId: existingDepartment.institutionId,
            code,
          },
        },
      });
      if (duplicateCode)
        throw new Error(
          "Department code already exists within this institution"
        );
    }

    // Uncomment for Redis/BullMQ integration
    // return await DepartmentQueue.add('update-department', { identity: id, data });

    return prisma.department.update({
      where: { id },
      data: {
        name,
        code,
        description,
        updatedAt: new Date(),
      },
    });
  }

  async deleteDepartment(id: string): Promise<void> {
    if (!id) throw new Error("Department ID is required");

    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });
    if (!existingDepartment) throw new Error("Department not found");

    // Uncomment for Redis/BullMQ integration
    // await DepartmentQueue.add('delete-department', { identity: id });

    await prisma.department.delete({ where: { id } });
  }

  async getAllDepartmentsByInstitute(institutionId: string) {
    return await prisma.department.findMany({
      where: { institutionId },
    });
  }
}
