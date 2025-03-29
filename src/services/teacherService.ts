import prisma from '@/config/prisma';

export class TeacherService {
  async getAllTeachers() {
    return prisma.teacher.findMany();
  }

  async createTeacher(data: any) {
    return prisma.teacher.create({ data });
  }

  async getTeacherById(id: string) {
    return prisma.teacher.findUnique({ where: { id } });
  }

  async updateTeacher(id: string, data: any) {
    return prisma.teacher.update({ where: { id }, data });
  }

  async deleteTeacher(id: string) {
    return prisma.teacher.delete({ where: { id } });
  }
}
