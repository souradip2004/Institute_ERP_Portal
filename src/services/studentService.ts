import prisma from "@/config/prisma";
import { studentQueue } from "@/bullmq/queues/student";

export class StudentService {
  async getAllStudents() {
    return prisma.student.findMany({
      include: {
        user: true,
      },
    });
  }

  async createStudent(data: any) {
    let user;

    // Check if userId is provided - use existing user
    if (data.userId) {
      // Verify the user exists and isn't already linked to a student
      user = await prisma.user.findUnique({
        where: { id: data.userId },
        include: { student: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.student) {
        throw new Error("This user is already linked to a student");
      }
    } else {
      // Create a new user if userId is not provided
      user = await prisma.user.create({
        data: {
          email: data.email,
          password: data.password,
          role: "STUDENT",
          institutionId: data.institutionId,
        },
      });

      if (!user) {
        throw new Error("Failed to create user");
      }
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: {
        id: data.departmentId,
      },
    });

    if (!department) {
      throw new Error("Department not found");
    }

    // Verify batch exists
    const batch = await prisma.batch.findUnique({
      where: {
        id: data.batchId,
      },
    });

    if (!batch) {
      throw new Error("Batch not found");
    }

    // Create student with proper relations
    return prisma.student.create({
      data: {
        userId: user.id,
        studentRoll: data.rollNumber || data.studentRoll,
        parentGuardianName: data.parentGuardianName,
        parentGuardianPhone: data.parentGuardianPhone,
        parentGuardianEmail: data.parentGuardianEmail,
        departmentId: data.departmentId,
        batchId: data.batchId,
        currentSemester: data.currentSemester,
        currentYear: data.currentYear,
        enrollmentStatus: "ACTIVE",
      },
      include: {
        user: true,
        department: true,
        batch: true,
      },
    });
  }

  async getStudentById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async updateStudent(id: string, data: any) {
    return studentQueue.add("update-student", {
      data,
      identity: id,
    });
  }

  async deleteStudent(id: string) {
    return studentQueue.add("delete-student", {
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
