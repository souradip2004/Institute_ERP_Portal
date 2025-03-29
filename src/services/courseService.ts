import prisma from '@/config/prisma';
import { courseQueue } from '@/bullmq/queues/Course';
export class CourseService {
  async getAllCourses() {
    return await prisma.course.findMany({
      include: { department: true, createdBy: true },
    });
  }

  async createCourse(data: any) {
    console.log('Creating course:', data);
    return await 
      courseQueue.add('create-course', {
        data
      });
  }

  async getCourseById(id: string) {
    return await prisma.course.findUnique({
      where: { id },
      include: { department: true, createdBy: true },
    });
  }

  async updateCourse(id: string, data: any) {
    const { courseCode, name, description, creditHours, courseType } = data;
    return await courseQueue.add('update-course',{
      identity:id,
      data,
    })
  }

  async deleteCourse(id: string) {
    return await courseQueue.add('delete-course',{
      identity:id
    });
  }
}
