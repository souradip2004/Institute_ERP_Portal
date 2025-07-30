import prisma from "@/lib/prisma";
import {Prisma, Status, SessionType, AttendanceStatus} from "@prisma/client";
import {upsertAttendance} from "@/utils/upsertAttendanceRecords";

interface CreateAttendanceSessionInput {
  teacherId: string;
  courseId: string;
  classSectionId: string;
  sessionDate: string | Date;
  startTime: string | Date;
  endTime: string | Date;
  sessionType?: SessionType;
}

interface AttendanceSessionResponse {
  id: string;
  classSection: {
    id: string;
    batch: { batchName: string };
    semester: { name: string };
  };
  course: { id: string; name: string; courseCode: string };
  sessionDate: Date;
  startTime: Date;
  endTime: Date;
  sessionType: SessionType;
  status: Status;
}

interface AttendanceSessionListItem {
  id: string;
  classSection: {
    id: string;
    name: string;
  };
  course: {
    id: string;
    name: string;
    code: string;
  };
  date: Date;
  startTime: Date;
  endTime: Date;
  status: Status;
  presentCount: number;
  absentCount: number;
}

interface StudentAttendance {
  userId: string;
  studentId: string;
  name: string;
  rollNo: string;
  attendancePercentage: number;
  status: AttendanceStatus | null;
}

interface AttendanceSessionDetails {
  id: string;
  classSection: {
    id: string;
    name: string;
  };
  course: {
    id: string;
    name: string;
    code: string;
  };
  date: Date;
  startTime: Date;
  endTime: Date;
  status: Status;
  presentCount: number;
  absentCount: number;
  students: StudentAttendance[];
}

interface AttendanceData {
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  remarks?: string;
}

interface SaveAttendanceInput {
  sessionId: string;
  teacherId: string;
  attendanceData: AttendanceData[];
}

interface SaveAttendanceResponse {
  message: string;
}

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus | null;
  remarks: string | null;
}

interface AttendanceBySessionResponse {
  sessionId: string;
  attendanceRecords: AttendanceRecord[];
}


export class AttendanceTeacherService {
  async createAttendanceSession({
    teacherId,
    courseId,
    classSectionId,
    sessionDate,
    startTime,
    endTime,
    sessionType,
  }: CreateAttendanceSessionInput): Promise<AttendanceSessionResponse> {
    try {
      if (!teacherId || !courseId || !classSectionId || !sessionDate || !startTime || !endTime) {
        throw new Error("All fields are required");
      }

      const start: Date = new Date(startTime);
      const end: Date = new Date(endTime);
      const sessionDateObj: Date = new Date(sessionDate);
      if (end <= start) {
        throw new Error("End time must be after start time");
      }
      if (sessionDateObj < new Date()) {
        throw new Error("Session date cannot be in the past");
      }

      const teacher: any = await prisma.teacher.findUnique({where: {id: teacherId}});
      const course: any = await prisma.course.findUnique({where: {id: courseId}});
      const classSection: any = await prisma.classSection.findUnique({
        where: {id: classSectionId},
      });

      if (!teacher) throw new Error("Invalid teacherId");
      if (!course) throw new Error("Invalid courseId");
      if (!classSection) throw new Error("Invalid classSectionId");

      if (classSection.teacherId !== teacherId) {
        throw new Error("Class section does not belong to this teacher");
      }

      const existingSession: any = await prisma.attendanceSession.findFirst({
        where: {
          teacherId,
          sessionDate: sessionDateObj,
          OR: [
            {startTime: {lte: end}, endTime: {gte: start}},
          ],
        },
      });
      if (existingSession) {
        throw new Error("Teacher already has a session scheduled in this time slot");
      }

      const session: any = await prisma.attendanceSession.create({
        data: {
          classSectionId,
          courseId,
          teacherId,
          sessionDate: sessionDateObj,
          startTime: start,
          endTime: end,
          sessionType: sessionType || SessionType.LECTURE,
          status: Status.SCHEDULED,
        },
        include: {
          classSection: {
            include: {batch: true, semester: true},
          },
          course: true,
        },
      });

      return session;
    } catch (error: any) {
      console.error("Error creating attendance session:", error);
      throw error instanceof Error ? error : new Error("Unknown error");
    }
  }


  async getTodayAttendanceSessions(id: string): Promise<AttendanceSessionResponse> {
    try {
      // Input validation
      if (!id || typeof id !== "string") {
        throw new Error("Valid ID is required");
      }

      let teacherId: string;
      let userId: string;

      // Check if the provided ID is a teacher ID
      const teacher = await prisma.teacher.findUnique({
        where: {id},
        include: {user: true},
      });

      if (teacher) {
        // ID is a teacher ID
        teacherId = id;
        userId = teacher.userId;
      } else {
        // ID might be a user ID, try to find teacher by userId
        const teacherByUser = await prisma.teacher.findFirst({
          where: {userId: id},
          include: {user: true},
        });

        if (!teacherByUser) {
          throw new Error("No teacher found for the provided ID");
        }

        teacherId = teacherByUser.id;
        userId = id;
      }

      // Set date range for today
      const today: Date = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow: Date = new Date(today);
      tomorrow.setDate(today.getDate() + 2);

      // Fetch attendance sessions
      const sessions = await prisma.attendanceSession.findMany({
        where: {
          teacherId,
          sessionDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          classSection: {
            include: {
              batch: true,
              semester: true,
            },
          },
          course: true,
          attendanceRecords: {
            select: {
              status: true,
            },
          },
        },
        orderBy: {sessionDate: "asc"},
      });

      // Structure the response
      const structuredSessions: AttendanceSessionListItem[] = sessions.map((session: any) => {
        const presentCount: number = session.attendanceRecords.filter(
          (record: any) => record.status === "PRESENT" || record.status === "LATE"
        ).length;
        const absentCount: number = session.attendanceRecords.filter(
          (record: any) => record.status === "ABSENT"
        ).length;

        return {
          id: session.id,
          classSection: {
            id: session.classSection.id,
            name: `${session.classSection.sectionName} - ${session.classSection.batch.batchName} - Sem ${session.classSection.semester.name}`,
          },
          course: {
            id: session.course.id,
            name: session.course.name,
            code: session.course.courseCode,
          },
          date: session.sessionDate,
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status,
          presentCount,
          absentCount,
        };
      });

      // Return sessions along with userId and teacherId
      return {
        sessions: structuredSessions,
        userId,
        teacherId,
      };
    } catch (error: any) {
      console.error("Error fetching today's attendance sessions:", error);
      throw error instanceof Error ? error : new Error("Unknown error");
    }
  }

  async getAttendanceSessionDetails(
    sessionId: string,
    teacherId: string
  ): Promise<AttendanceSessionDetails> {
    try {
      if (!sessionId || typeof sessionId !== "string") {
        throw new Error("Valid sessionId is required");
      }

      // Step 1: Fetch basic session info for validation and to get the classSectionId.
      // This is a small, fast query.
      const preliminarySession = await prisma.attendanceSession.findUnique({
        where: { id: sessionId },
        select: {
          teacherId: true,
          classSectionId: true,
        },
      });

      if (!preliminarySession) {
        throw new Error("Attendance session not found");
      }

      if (preliminarySession.teacherId !== teacherId) {
        throw new Error(
          `Teacher not authorized to view this session where teacherId: ${teacherId} and session.teacherId is: ${preliminarySession.teacherId}`
        );
      }

      // Now we have the correct ID for the class section.
      const classSectionId = preliminarySession.classSectionId;

      // Step 2: Fetch all the detailed data using the correct classSectionId in the nested query.
      const session: any = await prisma.attendanceSession.findUnique({
        where: { id: sessionId },
        include: {
          classSection: {
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
                      performanceMetrics: {
                        // THE FIX: Use the correct `classSectionId` variable here.
                        where: { classSectionId: { equals: classSectionId } },
                        select: { attendancePercentage: true },
                      },
                    },
                  },
                },
              },
            },
          },
          course: true,
          attendanceRecords: {
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      name: true,
                      username: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!session) {
        // This is unlikely to happen after the first check, but it's good for safety.
        throw new Error("Attendance session details could not be found.");
      }

      // The rest of your mapping logic remains the same, as it was already correct.
      const presentCount: number = session.attendanceRecords.filter(
        (record: any) => record.status === "PRESENT" || record.status === "LATE"
      ).length;
      const absentCount: number = session.attendanceRecords.filter(
        (record: any) => record.status === "ABSENT"
      ).length;

      const students: StudentAttendance[] = session.classSection.studentEnrollments.map(
        (enrollment: any) => {
          const attendanceRecord: any = session.attendanceRecords.find(
            (record: any) => record.studentId === enrollment.studentId
          );

          // This will now correctly find the metric object.
          const relevantMetric: any = enrollment.student.performanceMetrics[0];
          console.log("Relevant metric: ", relevantMetric);
          return {
            userId: enrollment.student.user.id,
            studentId: enrollment.student.id,
            name: enrollment.student.user?.name || "Unknown",
            rollNo: enrollment.student.studentRoll,
            attendancePercentage: relevantMetric?.attendancePercentage || 0,
            status: attendanceRecord?.status || null,
          };
        }
      );

      return {
        id: session.id,
        classSection: {
          id: session.classSection.id,
          name: `${session.course.name} - ${session.classSection.batch.batchName} - Sem ${session.classSection.semester.name}`,
        },
        course: {
          id: session.course.id,
          name: session.course.name,
          code: session.course.courseCode,
        },
        date: session.sessionDate,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        presentCount,
        absentCount,
        students,
      };
    } catch (error: any) {
      console.error("Error fetching attendance session details:", error);
      throw error instanceof Error ? error : new Error("Unknown error");
    }
  }

  async saveAttendanceRecords({
    sessionId,
    teacherId,
    attendanceData,
  }: SaveAttendanceInput): Promise<SaveAttendanceResponse> {
    try {
      // 1. Validate Input and Session
      if (!sessionId || !teacherId || !Array.isArray(attendanceData) || attendanceData.length === 0) {
        throw new Error("Invalid input: sessionId, teacherId, and non-empty attendanceData are required");
      }

      const session = await prisma.attendanceSession.findUnique({
        where: {id: sessionId},
        include: {
          classSection: {
            include: {
              semester: true, // Required for the performance metric key
            },
          },
        },
      });

      if (!session) throw new Error("Attendance session not found");
      if (session.teacherId !== teacherId) throw new Error("Teacher not authorized for this session");
      if (['COMPLETED', 'CANCELLED'].includes(session.status)) {
        throw new Error(`Cannot update attendance for a ${session.status} session`);
      }

      // 2. Upsert Attendance Records for Each Student
      // (This section reuses your existing logic and the external `upsertAttendance` function)
      for (const record of attendanceData) {
        const res = await upsertAttendance({
          attendanceSessionId: sessionId,
          studentId: record.studentId,
          status: record.status,
          remarks: record.remarks,
          recordedById: teacherId,
          recordedAt: new Date(),
        });
        if (!res.success) {
          console.error(`❌ Failed to save attendance for studentId: ${record.studentId}. Reason: ${res.message}`);
        }
      }

      // 3. Check if the Session is Fully Recorded and Mark as Completed
      const enrolledStudents = await prisma.studentClassEnrollment.findMany({
        where: {classSectionId: session.classSectionId},
        select: {studentId: true},
      });
      const studentCount = enrolledStudents.length;
      const attendanceCount = await prisma.attendance.count({
        where: {attendanceSessionId: sessionId},
      });

      if (attendanceCount >= studentCount) {
        // Mark the session as completed
        await prisma.attendanceSession.update({
          where: {id: sessionId},
          data: {status: 'COMPLETED'},
        });
        console.log(`✅ Session ${sessionId} marked as COMPLETED.`);

        // 4. Update Performance Metrics for ALL Enrolled Students
        console.log(`⏳ Starting performance metric update for all ${studentCount} students in class ${session.classSectionId}...`);

        // Get total completed sessions for the course ONCE, now including the one we just marked.
        const totalCourseSessions = await prisma.attendanceSession.count({
          where: {
            courseId: session.courseId,
            classSectionId: session.classSectionId,
            status: 'COMPLETED'
          },
        });

        if (totalCourseSessions > 0) {
          for (const enrollment of enrolledStudents) {
            const studentId = enrollment.studentId;

            // Get the number of 'PRESENT' records for this specific student.
            const presentCount = await prisma.attendance.count({
              where: {
                studentId: studentId,
                status: 'PRESENT',
                attendanceSession: {
                  courseId: session.courseId,
                  classSectionId: session.classSectionId,
                  status: 'COMPLETED',
                },
              },
            });

            // Calculate percentage.
            const attendancePercentage = Number(((presentCount / totalCourseSessions) * 100).toFixed(2));

            // Upsert the performance metric.
            const existingMetric = await prisma.studentPerformanceMetric.findFirst({
              where: {
                studentId: studentId,
                classSectionId: session.classSectionId,
                semesterId: session.classSection.semesterId,
              }
            });

            if (existingMetric) {

              await prisma.studentPerformanceMetric.update({
                where: {id: existingMetric.id},
                data: {attendancePercentage},
              });
            } else {

              await prisma.studentPerformanceMetric.create({
                data: {
                  studentId: studentId,
                  classSectionId: session.classSectionId,
                  semesterId: session.classSection.semesterId,
                  attendancePercentage,
                  overallGradePoints: 0,
                  assignmentCompletionRate: 0,
                  detailedMetrics: {},
                  performanceCategory: 'SATISFACTORY',
                }
              });
            }
            console.log(`✅ Performance metrics updated for student ${studentId}. Percentage: ${attendancePercentage}%`);
          }
        }
      }

      console.log("✅ [Success] Attendance process completed successfully");
      return {message: "Attendance saved successfully"};

    } catch
      (error: any) {
      console.error("❌ [Error] in saveAttendanceAndMetrics:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new Error(
          `Foreign key constraint violation: One or more student IDs do not exist in the Student table.`
        );
      }
      throw error instanceof Error ? error : new Error("An unknown error occurred during the attendance saving process.");
    }
  }


  async getAttendanceBySessionId(sessionId: string
  ):
    Promise<AttendanceBySessionResponse> {
    try {
      if (!sessionId || typeof sessionId !== "string"
      ) {
        throw new Error("Valid sessionId is required");
      }

      const session: any = await prisma.attendanceSession.findUnique({
        where: {id: sessionId},
        include: {
          attendanceRecords: {
            select: {
              studentId: true,
              status: true,
              remarks: true,
            },
          },
        },
      });

      if (!session) {
        throw new Error("Attendance session not found");
      }

      const attendanceRecords: AttendanceRecord[] = session.attendanceRecords.map((record: any) => ({
        studentId: record.studentId,
        status: record.status,
        remarks: record.remarks,
      }));

      return {
        sessionId: session.id,
        attendanceRecords,
      };
    } catch
      (error: any) {
      console.error("Error fetching attendance by session ID:", error);
      throw error instanceof Error ? error : new Error("Unknown error");
    }
  }
}

