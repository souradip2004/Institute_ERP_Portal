import prisma from "@/lib/prisma";
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
  console.log("Creating student with data:", data);
  let user;

  try {
    // Handle user creation or connection
    if (data.user?.connect?.id) {
      user = await prisma.user.findUnique({
        where: { id: data.user.connect.id },
        include: { student: true },
      });

      if (!user) throw new Error("User not found");
      if (user.student) throw new Error("This user is already linked to a student");
    } else {
      user = await prisma.user.create({
        data: {
          email: data.email,
          password: data.password,
          role: "STUDENT",
          institutionId: data.institutionId,
        },
      });
    }

    // Validate department
    const department = await prisma.department.findUnique({
      where: { id: data.department.connect.id },
    });
    if (!department) throw new Error("Department not found");

    // Validate batch
    const batch = await prisma.batch.findUnique({
      where: { id: data.batch.connect.id },
    });
    if (!batch) throw new Error("Batch not found");

    // Create student
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentRoll: data.rollNumber || data.studentRoll,
        departmentId: data.department.connect.id,
        batchId: data.batch.connect.id,
        currentSemester: data.currentSemester,
        currentYear: data.currentYear,
        enrollmentStatus: "ACTIVE",
      },
    });

    if (!student) throw new Error("Failed to create student");

    // Enroll in multiple classes
    const enrollmentPromises = (data.classes?.connect || []).map((cls: { id: string }) =>
      prisma.studentClassEnrollment.create({
        data: {
          studentId: student.id,
          classSectionId: cls.id,
          enrollmentStatus: "ENROLLED",
        },
      })
    );

    const enrollments = await Promise.all(enrollmentPromises);

    // Return full student object with relations
    const studentWithDetails = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        user: true,
        department: true,
        batch: true,
        classEnrollments: {
          include: {
            classSection: true,
          },
        },
      },
    });

    if (!studentWithDetails) throw new Error("Failed to fetch student with classes");

    return studentWithDetails;

  } catch (error) {
    console.error("Error creating student:", error);
    throw new Error("Failed to create student");
  }
}


  async getStudentById(id: string, includeClassSection = false) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
        batch: true,
        classEnrollments: includeClassSection
          ? {
              include: {
                classSection: {
                  select: {
                    id: true,
                    sectionName: true,
                  },
                },
              },
            }
          : false,
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
