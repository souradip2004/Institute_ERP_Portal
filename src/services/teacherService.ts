import prisma from '@/config/prisma';
import { teacherQueue } from '@/bullmq/queues/Teacher';

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
    return prisma.teacher.findUnique({ where: { id } });
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
        user: true,
        department: true,

        departmentHeadRole: {
          include: {
            department: true,
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },

        classSections: {
          include: {
            batch: true,
            course: {
              include: {
                department: true,
                createdBy: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            semester: true,
            studentEnrollments: {
              include: {
                student: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            announcements: true,
            attendanceSessions: {
              include: {
                attendanceRecords: {
                  include: {
                    student: {
                      include: {
                        user: true,
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
                    user: true,
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
                user: true,
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
                    user: true,
                  },
                },
              },
            },
          },
        },

        aiVideoContents: {
          include: {
            course: true,
          },
        },

        aiQuestionBanks: {
          include: {
            course: true,
          },
        },

        announcements: {
          include: {
            department: true,
            classSection: true,
            institution: true,
          },
        },

        createdCourses: {
          include: {
            department: true,
          },
        },

        createdExams: true,
        createdQuestions: true,

        attendanceRecords: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },

        gradedExamSubmissions: {
          include: {
            exam: true,
            student: {
              include: {
                user: true,
              },
            },
            answerScripts: {
              include: {
                question: true,
                gradedBy: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },

        gradedAnswerScripts: {
          include: {
            examSubmission: {
              include: {
                exam: true,  // Include the exam linked to this submission
              },
            },
            question: true,  // Include the question for the answer script
            gradedBy: {
              include: {
                user: true,  // Include the teacher who graded the answer script
              },
            },
          },
        },


        evaluatedMetrics: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },

        createdVideos: {
          include: {
            course: true,
          },
        },

        createdQuestionBanks: {
          include: {
            course: true,
          },
        },
      },
    });
  }


  async  getTeacherAttendanceBySection(teacherId: string) {
  const teacherWithSections = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      classSections: {
        include: {
          batch: true,
          course: true,
          semester: true,
          attendanceSessions: {
            include: {
              attendanceRecords: {
                include: {
                  student: {
                    include: {
                      user: true,
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

  const sectionWiseAttendance = teacherWithSections.classSections.map(section => ({
    classSection: {
      id: section.id,
      name: `${section.course.name} - ${section.batch.batchName} - Sem ${section.semester.name}`,
    },
    attendanceSessions: section.attendanceSessions.map(session => ({
      id: session.id,
      date: session.sessionDate,
      attendanceRecords: session.attendanceRecords.map(record => ({
        status: record.status,
        student: {
          id: record.student.id,
          name: record.student.user.name,
          email: record.student.user.email,
        },
      })),
    })),
  }));

  return sectionWiseAttendance;
}




}
