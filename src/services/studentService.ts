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
    // return studentQueue.add('create-student', {
    //   data,
    // });


const defaultData = {
  userId: data.userId || "2a7dbf9f-8a43-44c3-89cd-099eef145cb8",
  studentId: data.rollNumber || "STU123dsd456",
  firstName: data.firstName || "Rakesh",
  lastName: data.lastName || "Doe",
  gender: data.gender || "Male",
  dateOfBirth: data.dateOfBirth || new Date("2005-08-15T00:00:00.000Z"),
  address: data.address || "123 Main St, Cityville",
  phone: data.phone || "+1234567890",
  parentGuardianName: data.parentGuardianName || "Jane Doe",
  parentGuardianPhone: data.parentGuardianPhone || "+0987654321",
  parentGuardianEmail: data.parentGuardianEmail || "jane.doe@example.com",
  departmentId: data.departmentId || "cm8xcuqwl000jxz47bq3hpij9",
  batchId: data.batchId || "cm8vrfoge0003xz8f3s0d9zl9",
  currentSemester: data.currentSemester || 2,
  currentYear: data.currentYear || 1,
  enrollmentStatus: data.enrollmentStatus || "active",
};



    // console.log('student data to create: ',data);
    return prisma.student.create({
      data: defaultData,
    });
  }

  async getStudentById(id: string) {
    return prisma.student.findUnique({ where: { id } });
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
}
