import prisma from '@/config/prisma';
import { studentQueue } from '@/bullmq/queues/student';
export class StudentService {
  async getAllStudents() {
    return prisma.student.findMany({
      include: {
        user: true,
      },
    });
  }

  async createStudent(data: any) {
    console.log('hello from student service');
    return prisma.student.create({
      data
    });
  }

  async getStudentById(id: string) {
    return prisma.student.findUnique({ where: { id }, include: {
        user: true,
      }, });
  }

  async updateStudent(id: string, data: any) {
    return studentQueue.add('update-student', {
      data,
      identity: id,
    });
  }

  async deleteStudent(id: string) {
    return studentQueue.add('delete-student', {
      identity: id,
    });
  }

  async getStudentsByBatchId(batchId: string) {
    return prisma.student.findMany({
      where: { batchId },
      include: {
        user: true,
      },
    });
  }

  async getStudentsByDeptId(departmentId: string) {
    return prisma.student.findMany({
      where: { departmentId },
      include: {
        user: true,
      },
    });
  }
}
