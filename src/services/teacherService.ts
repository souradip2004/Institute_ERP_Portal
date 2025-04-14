import prisma from '@/config/prisma';
import {teacherQueue} from '@/bullmq/queues/Teacher';

export class TeacherService {
  async getAllTeachers() {
    console.log('hit teacher service for getting all teachers');
    return prisma.teacher.findMany({  include: {
    user: true, 
  },});
  }
async getTeacherByuserId(userId: string) {
  console.log('hit teacher service for getting teacher by userId');
  console.log(userId);
  return prisma.teacher.findUnique({ where: { userId }, include: { user: true } });
}
async createTeacher(data: any) {
    return await prisma.teacher.create({ data });
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
