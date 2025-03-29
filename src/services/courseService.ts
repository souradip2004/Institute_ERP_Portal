import prisma from '@/config/prisma';

export class CourseService {
  async getAllCourses() {
    return await prisma.course.findMany({
      include: { department: true, createdBy: true },
    });
  }

  async createCourse(data: any) {
    const { courseCode, name, description, creditHours, courseType, departmentId, createdById } = data;
    return await prisma.course.create({
      data: { courseCode, name, description, creditHours, courseType, departmentId, createdById },
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
    return await prisma.course.update({
      where: { id },
      data: { courseCode, name, description, creditHours, courseType },
    });
  }

  async deleteCourse(id: string) {
    return await prisma.course.delete({ where: { id } });
  }
}
