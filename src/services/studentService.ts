import prisma from "@/lib/prisma";

interface IStudentUpdateData {
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  username?: string;
  gender?: string;
  name?: string;
  email?: string;
  studentRoll?: string;
  parentGuardianName?: string;
  parentGuardianPhone?: string;
  parentGuardianEmail?: string;
}

export class StudentService {
  async getAllStudents() {
    return prisma.student.findMany({
      include: {
        user: true,
        department: {
          select: {
            name: true,
          }
        },
        batch: {
          select: {
            batchName: true,
            year: true,
          }
        }
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
          where: {id: data.user.connect.id},
          include: {student: true},
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
        where: {id: data.department.connect.id},
      });
      if (!department) throw new Error("Department not found");

      // Validate batch
      const batch = await prisma.batch.findUnique({
        where: {id: data.batch.connect.id},
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
        where: {id: student.id},
        include: {
          user: true,
          department: true,
          batch: true,
          classEnrollments: {
            include: {
              classSection: true
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


  async getStudentById(id: string, includeClassSection = true) {
    return prisma.student.findUnique({
      where: {id},
      include: {
        user: true,
        department: true,
        batch: true,
        classEnrollments: {
          include: {
            classSection: {
              include: {
                semester: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          }
        },
      },
    });
  }

  async updateStudent(id: string, data: IStudentUpdateData) {
    /* return studentQueue.add("update-student", {
       data,
       identity: id
     });*/
    const {
      dateOfBirth,
      parentGuardianEmail,
      parentGuardianName,
      parentGuardianPhone,
      phone,
      gender,
      address,
      username,
      name,
      studentRoll,
      email
    } = data;
    console.log("Id ", id);
    if (!id) {
      throw new Error("Student ID is required");
    }

    return prisma.student.update({
      where: {id},
      data: {
        parentGuardianPhone: parentGuardianPhone,
        parentGuardianEmail: parentGuardianEmail,
        parentGuardianName: parentGuardianName,
        studentRoll: studentRoll,
        user: {
          update: {
            username: username,
            phone: phone,
            address: address,
            gender: gender,
            name: name,
            email: email,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null
          }
        }
      },
      include: {
        user: true,
        department: true,
        batch: true,
        classEnrollments: {
          include: {
            classSection: {
              include: {
                semester: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
      },
    })

  }

  async deleteStudent(id: string) {

  }

  async getStudentsByBatchId(batchId: string) {
    return prisma.student.findMany({
      where: {batchId},
      include: {
        user: true,
        department: {
          select: {
            name: true
          }
        },
        batch: {
          select: {
            batchName: true,
            year: true,
          }
        }
      },
    });
  }

  async getStudentsByDeptId(departmentId: string) {
    return prisma.student.findMany({
      where: {departmentId},
      include: {
        user: true,
        department: {
          select: {
            name: true,
          }
        },
        batch: {
          select: {
            batchName: true,
            year: true,
          }
        }
      },
    });
  }
}
