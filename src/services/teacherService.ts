import prisma from '@/config/prisma';
import {teacherQueue} from '@/bullmq/queues/Teacher';

export class TeacherService {
  async getAllTeachers() {
    return prisma.teacher.findMany();
  }

  async createTeacher(data: any) {
    return await teacherQueue.add('create-teacher',{
      data
    });
  }

  async getTeacherById(id: string) {
    return prisma.teacher.findUnique({ where: { id } });
  }

  async updateTeacher(id: string, data: any) {
    return  teacherQueue.add('update-teacher',{
      data,
      identity:id
    });
  }

  async deleteTeacher(id: string) {
    return  teacherQueue.add('delete-teacher',{
      identity:id
    });
  }
}
