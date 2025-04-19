import prisma from "@/lib/prisma";
import { AttendanceSession, SessionType, Status } from "@prisma/client";

export interface CreateAttendanceSessionDTO {
  classSectionId: string;
  teacherId: string;
  courseId: string;
  sessionDate: Date;
  startTime: Date;
  endTime: Date;
  sessionType: SessionType;
  status?: Status;
}

export interface UpdateAttendanceSessionDTO {
  status?: Status;
  sessionDate?: Date;
  startTime?: Date;
  endTime?: Date;
  sessionType?: SessionType;
}

export interface AttendanceSessionFilter {
  teacherId?: string;
  courseId?: string;
  classSectionId?: string;
  status?: Status;
  fromDate?: Date;
  toDate?: Date;
}

export class AttendanceSessionService {
  async createAttendanceSession(
    data: CreateAttendanceSessionDTO
  ): Promise<AttendanceSession> {
    return prisma.attendanceSession.create({
      data: {
        classSectionId: data.classSectionId,
        teacherId: data.teacherId,
        courseId: data.courseId,
        sessionDate: data.sessionDate,
        startTime: data.startTime,
        endTime: data.endTime,
        sessionType: data.sessionType,
        status: data.status || Status.SCHEDULED,
      },
    });
  }

  async getAttendanceSessions(
    filters: AttendanceSessionFilter
  ): Promise<AttendanceSession[]> {
    const { teacherId, classSectionId, courseId, status, fromDate, toDate } =
      filters;

    return prisma.attendanceSession.findMany({
      where: {
        teacherId: teacherId || undefined,
        courseId: courseId || undefined,
        classSectionId: classSectionId || undefined,
        status: status ? status : undefined, // Ensure status is only included if provided
        sessionDate: {
          gte: fromDate || undefined,
          lte: toDate || undefined,
        },
      },
      include: {
        teacher: { select: { user: { select: { name: true } } } },
        course: {
          select: {
            id: true,
            name: true,
            courseCode: true,
          },
        },
        classSection: {
          select: {
            sectionName: true,
          },
        },
      },
      orderBy: { sessionDate: "desc" },
    });
  }

  async getAttendanceSessionById(
    id: string
  ): Promise<AttendanceSession | null> {
    return prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        teacher: { select: { user: { select: { name: true } } } },
        course: { select: { name: true, courseCode: true } },
        classSection: {
          select: {
            sectionName: true,
            studentEnrollments: {
              include: {
                student: {
                  select: { id: true, user: { select: { name: true } } },
                },
              },
            },
          },
        },
        attendanceRecords: true,
      },
    });
  }

  async updateAttendanceSession(
    id: string,
    data: UpdateAttendanceSessionDTO
  ): Promise<AttendanceSession> {
    return prisma.attendanceSession.update({
      where: { id },
      data: {
        status: data.status,
        sessionDate: data.sessionDate,
        startTime: data.startTime,
        endTime: data.endTime,
        sessionType: data.sessionType,
        updatedAt: new Date(),
      },
    });
  }

  async checkSessionExists(id: string): Promise<boolean> {
    const session = await prisma.attendanceSession.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!session;
  }
}
