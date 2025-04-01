import prisma from '@/config/prisma';
import {teacherQueue} from '@/bullmq/queues/Teacher';

export class TeacherService {
  async getAllTeachers() {
    console.log('hit teacher service for getting all teachers');
    return prisma.teacher.findMany({  include: {
    user: true, 
  },});
  }

async createTeacher(data: any) {
    console.log('hi from create teacher service');
    
    // Set default/hardcoded values for any missing fields
    const teacherData = {
        userId: data.userId || 'cm8xcezij000bxz47s7pztg4a', // You might want to make this required
        teacherId: data.teacherId || `IT_${Math.floor(Math.random() * 100)}`, // Example random ID
        firstName: data.firstName || 'Unknown',
        lastName: data.lastName || 'Teacher',
        gender: data.gender || 'Other',
        dateOfBirth: data.dateOfBirth || new Date('1980-01-01'),
        address: data.address || 'Address not provided',
        phone: data.phone || '+000-000-0000',
        qualification: data.qualification || 'Bachelor\'s Degree',
        joiningDate: data.joiningDate || new Date(),
        employmentStatus: data.employmentStatus || 'fullTime',
        departmentId: data.departmentId || 'cm8xcuqwl000jxz47bq3hpij9', // Should be required or have a default
        performanceScore: data.performanceScore !== undefined ? data.performanceScore : 75.0,
        lastEvaluationDate: data.lastEvaluationDate || new Date()
    };

    return await prisma.teacher.create({ data: teacherData });
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
