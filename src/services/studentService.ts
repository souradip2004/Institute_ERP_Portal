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
    console.log("hello from student service");
    console.log(data);
    data.studentRoll = data.rollNumber || data.studentRoll;
    data.enrollmentStatus = "ACTIVE";

    // Create user first
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        role: "STUDENT",
        institutionId: data.institutionid,
      },
    });

    if (!user) {
      throw new Error("Failed to create user");
    }

    // Get department - use departmentId if provided directly in the payload
    const departmentId = data.departmentId;
    const department = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      throw new Error("Department not found");
    }

    console.log(department);
    data.department = {};
    data.department.connect = { id: department.id };

    // Get batch - use batchId if provided directly in the payload
    const batchId = data.batchId;
    const batch = await prisma.batch
      .findUnique({
        where: {
          id: batchId,
        },
      })
      .then((data) => {
        return data;
      })
      .catch((e) => {
        console.log(e);
      });
    if (!batch) {
      throw new Error("Batch not found");
    }

    data.batch = {};
    data.batch.connect = { id: batch.id };

    // Connect to the user we just created
    data.user = {};
    data.user.connect = { id: user.id };

    console.log(data);

    delete data.rollNumber;
    delete data.userId;
    delete data.email;
    delete data.password;
    delete data.institutionid;
    delete data.class;
    delete data.newDepartment;
    delete data.departmentId;
    delete data.batchId;

    return prisma.student.create({
      data,
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
