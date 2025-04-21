import prisma from '@/lib/prisma';
import { teacherQueue } from '@/bullmq/queues/Teacher';
import { json } from 'stream/consumers';

export class TeacherService {

  async getAllTeachers() {
    console.log('hit teacher service for getting all teachers');
    return prisma.teacher.findMany({
      include: {
        user: true,
      },
    });
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
    return prisma.teacher.findUnique({ where: { id },include:{user:true} });
  }

  async updateTeacher(id: string, data: any) {
    return teacherQueue.add('update-teacher', {
      data,
      identity: id
    });
  }

  async deleteTeacher(id: string) {
    return teacherQueue.add('delete-teacher', {
      identity: id
    });
  }


  async getTeacherDashboardDetail(teacherId: string) {
    return prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        department: true,
        departmentHeadRole: {
          include: {
            department: true,
            teacher: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
        classSections: {
          take: 10, // Add pagination
          include: {
            batch: true,
            semester: true,
            studentEnrollments: {
              include: {
                student: {
                  include: {
                    user: { select: { id: true, name: true } },
                  },
                },
              },
            },
            announcements: true,
            attendanceSessions: {
              include: {
                course: true, // Moved course here
                attendanceRecords: {
                  include: {
                    student: {
                      include: {
                        user: { select: { id: true, name: true } },
                      },
                    },
                  },
                },
              },
            },
            exams: true,
            aiVideoContents: true,
            studentMetrics: {
              include: {
                student: {
                  include: {
                    user: { select: { id: true, name: true } },
                  },
                },
                semester: true,
              },
            },
          },
        },
        performanceMetrics: {
          include: {
            department: true,
            semester: true,
            evaluatedBy: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
        attendanceSessions: {
          include: {
            classSection: true,
            attendanceRecords: {
              include: {
                student: {
                  include: {
                    user: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
        aiVideoContents: {
          include: { course: true },
        },
        aiQuestionBanks: {
          include: { course: true },
        },
        announcements: {
          include: {
            department: true,
            classSection: true,
            institution: true,
          },
        },
        createdCourses: {
          include: { department: true },
        },
        createdExams: true,
        createdQuestions: true,
        attendanceRecords: {
          include: {
            student: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
        gradedExamSubmissions: {
          include: {
            exam: true,
            student: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
            answerScripts: {
              include: {
                question: true,
                gradedBy: {
                  include: {
                    user: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
        gradedAnswerScripts: {
          include: {
            examSubmission: {
              include: { exam: true },
            },
            question: true,
            gradedBy: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
        evaluatedMetrics: {
          include: {
            teacher: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
        createdVideos: {
          include: { course: true },
        },
        createdQuestionBanks: {
          include: { course: true },
        },
        createdAssignments: {
          include: {
            classSection: true,
            attachments: true,
            comments: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
            submissions: {
              include: {
                student: {
                  include: {
                    user: { select: { id: true, name: true } },
                  },
                },
                gradedBy: {
                  include: {
                    user: { select: { id: true, name: true } },
                  },
                },
                attachments: true,
                comments: {
                  include: {
                    user: { select: { id: true, name: true } },
                  },
                },
              },
            },
            group: {
              include: {
                members: {
                  include: {
                    student: {
                      include: {
                        user: { select: { id: true, name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }



  async getTeacherAttendanceBySection(teacherId: string) {
    const teacherWithSections = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        classSections: {
          include: {
            batch: true,
            semester: true,
            attendanceSessions: {
              include: {
                course: true, // Moved course here
                attendanceRecords: {
                  include: {
                    student: {
                      include: {
                        user: {
                          select: { id: true, name: true, email: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!teacherWithSections) return null;

    const sectionWiseAttendance = teacherWithSections.classSections.map((section) => {
      // Use the first attendance session's course name, or fallback to a default
      const courseName =
        section.attendanceSessions[0]?.course?.name || "Unknown Course";
      return {
        classSection: {
          id: section.id,
          name: `${courseName} - ${section.batch.batchName} - Sem ${section.semester.name}`,
        },
        attendanceSessions: section.attendanceSessions.map((session) => ({
          id: session.id,
          date: session.sessionDate,
          attendanceRecords: session.attendanceRecords.map((record) => ({
            status: record.status,
            student: {
              id: record.student.id,
              name: record.student.user?.name || "Unknown",
              email: record.student.user?.email || "N/A",
            },
          })),
        }),
        )
      };
    });

    return sectionWiseAttendance;
  }

  async getSectionWithCourse(teacherId: string) {
    const classSections = await prisma.classSection.findMany({
      where: { teacherId },
      include: {
        batch: true,
        semester: true,
        studentEnrollments: {
          include: {
            student: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
        attendanceSessions: {
          include: {
            course: {
              include: {
                department: true,
                createdBy: {
                  include: {
                    user: {
                      select: { id: true, name: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!classSections || classSections.length === 0) return [];

    const structuredData = classSections.map((section) => {
      // Use the first attendance session's course, or provide a fallback
      const course = section.attendanceSessions[0]?.course || {
        id: "",
        name: "Unknown Course",
        courseCode: "N/A",
        department: null,
        createdBy: { id: "", user: { name: "Unknown", email: "N/A" } },
      };

      return {
        section: {
          id: section.id,
          name: `${section.batch.batchName} - Sem ${section.semester.name}`,
          batch: section.batch,
          semester: section.semester,
          maxStudents: section.maxStudents,
          enrolledStudents: section.studentEnrollments.map((enroll) => ({
            studentId: enroll.student.id,
            name: enroll.student.user?.name || "Unknown",
            email: enroll.student.user?.email || "N/A",
          })),
        },
        course: {
          id: course.id,
          name: course.name,
          code: course.courseCode,
          department: course.department,
          createdBy: {
            id: course.createdBy.id,
            name: course.createdBy.user?.name || "Unknown",
            email: course.createdBy.user?.email || "N/A",
          },
        },
      };
    });

    return structuredData;
  }





  async getTeacherAssignment(teacherId: string) {
    return prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        department: true,
        createdAssignments: {
          take: 10, // Add pagination
          include: {
            classSection: true,
            attachments: true,
            comments: {
              include: {
                user: {
                  select: { id: true, name: true },
                },
              },
            },
            submissions: {
              include: {
                student: {
                  include: {
                    user: {
                      select: { id: true, name: true, email: true },
                    },
                  },
                },
                gradedBy: {
                  include: {
                    user: {
                      select: { id: true, name: true },
                    },
                  },
                },
                attachments: true,
                comments: {
                  include: {
                    user: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
            group: {
              include: {
                members: {
                  include: {
                    student: {
                      include: {
                        user: {
                          select: { id: true, name: true, email: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }


  async getTeacherAttendanceSessions(teacherId: string) {
    try {
      // Validate teacherId
      if (!teacherId || typeof teacherId !== "string") {
        return "Invalid teacherId";
      }

      // Query attendance sessions for the teacher
      const classSections = await prisma.classSection.findMany({
        where: {
          teacherId,
        },
        include: {
          batch: true,
          semester: true,
          attendanceSessions: {
            include: {
              course: {
                include: {
                  department: true,
                  createdBy: {
                    include: {
                      user: {
                        select: { id: true, name: true, email: true },
                      },
                    },
                  },
                },
              },
              attendanceRecords: {
                include: {
                  student: {
                    include: {
                      user: {
                        select: { id: true, name: true, email: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // If no class sections found, return empty array
      if (!classSections || classSections.length === 0) {
        return []
      }

      // Structure the response similar to getTeacherAttendanceBySection
      const sectionWiseAttendance = classSections.map((section) => {
        const courseName =
          section.attendanceSessions[0]?.course?.name || "Unknown Course";
        return {
          classSection: {
            id: section.id,
            name: `${courseName} - ${section.batch.batchName} - Sem ${section.semester.name}`,
          },
          attendanceSessions: section.attendanceSessions.map((session) => ({
            id: session.id,
            date: session.sessionDate,
            status: session.status,
            course: {
              id: session.course.id,
              name: session.course.name,
              code: session.course.courseCode,
            },
            attendanceRecords: session.attendanceRecords.map((record) => ({
              status: record.status,
              student: {
                id: record.student.id,
                name: record.student.user?.name || "Unknown",
                email: record.student.user?.email || "N/A",
              },
            })),
          })),
        };
      });

      return sectionWiseAttendance;
    } catch (error) {
      console.error("Error fetching teacher attendance sessions:", error);
      return error
    }
  }
}



