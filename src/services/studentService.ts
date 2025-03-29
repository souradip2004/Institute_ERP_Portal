import prisma from '@/config/prisma';

export class StudentService {
  async getAllStudents() {
    return prisma.student.findMany();
  }

    async createStudent(data: any) {
      console.log('hello from student service');
    return prisma.student.create({ data });
  }

  async getStudentById(id: string) {
    return prisma.student.findUnique({ where: { id } });
  }

  async updateStudent(id: string, data: any) {
    return prisma.student.update({ where: { id }, data });
  }

  async deleteStudent(id: string) {
    return prisma.student.delete({ where: { id } });
  }
}
