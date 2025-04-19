import prisma from "@/lib/prisma";
import { Attendance, AttendanceStatus } from "@prisma/client";

export interface CreateAttendanceDTO {
  attendanceSessionId: string;
  studentId: string;
  status: AttendanceStatus;
  remarks?: string | null;
  recordedById: string;
}

export interface UpdateAttendanceDTO {
  status?: AttendanceStatus;
  remarks?: string | null;
  recordedById?: string;
}

export interface AttendanceFilter {
  attendanceSessionId?: string;
  studentId?: string;
  classSectionId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export class AttendanceService {
  async createAttendance(data: CreateAttendanceDTO[]): Promise<Attendance[]> {
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const results: Attendance[] = [];

      for (const record of data) {
        // Ensure that recordedById exists in the Teacher table
        const teacherExists = await tx.teacher.findUnique({
          where: { id: record.recordedById },
        });

        if (!teacherExists) {
          throw new Error(
            `Teacher with ID ${record.recordedById} does not exist.`
          );
        }

        // Check if the attendance record already exists
        const existing = await tx.attendance.findFirst({
          where: {
            attendanceSessionId: record.attendanceSessionId,
            studentId: record.studentId,
          },
        });

        let result;
        if (existing) {
          // Update existing record
          result = await tx.attendance.update({
            where: { id: existing.id },
            data: {
              status: record.status,
              remarks: record.remarks,
              recordedById: record.recordedById,
              updatedAt: now,
            },
          });
        } else {
          // Create new attendance record
          result = await tx.attendance.create({
            data: {
              attendanceSessionId: record.attendanceSessionId,
              studentId: record.studentId,
              status: record.status,
              remarks: record.remarks || null,
              recordedById: record.recordedById,
              recordedAt: now,
              updatedAt: now,
              isLocked: false,
            },
          });
        }

        results.push(result);
      }

      return results;
    });
  }

  async getAttendanceRecords(filters: AttendanceFilter): Promise<Attendance[]> {
    const { attendanceSessionId, studentId, classSectionId, fromDate, toDate } =
      filters;

    return prisma.attendance.findMany({
      where: {
        attendanceSessionId,
        studentId,
        attendanceSession: {
          classSectionId,
          sessionDate: { gte: fromDate, lte: toDate },
        },
      },
      include: {
        student: { select: { user: { select: { name: true } } } },
        attendanceSession: {
          select: {
            sessionDate: true,
            startTime: true,
            endTime: true,
            sessionType: true,
            classSection: { select: { sectionName: true } },
            course: { select: { name: true, courseCode: true } },
          },
        },
        recordedBy: { select: { teacherCode: true } },
      },
      orderBy: { attendanceSession: { sessionDate: "desc" } },
    });
  }

  async getAttendanceById(id: string): Promise<Attendance | null> {
    return prisma.attendance.findUnique({
      where: { id },
      include: {
        student: { select: { user: { select: { name: true } } } },
        attendanceSession: {
          select: {
            sessionDate: true,
            startTime: true,
            endTime: true,
            classSection: { select: { sectionName: true } },
            course: { select: { name: true, courseCode: true } },
          },
        },
      },
    });
  }

  async updateAttendance(
    id: string,
    data: UpdateAttendanceDTO
  ): Promise<Attendance> {
    return prisma.attendance.update({
      where: { id },
      data: {
        status: data.status,
        remarks: data.remarks,
        recordedById: data.recordedById,
        updatedAt: new Date(),
      },
    });
  }

  async checkAttendanceExists(id: string): Promise<boolean> {
    const attendance = await prisma.attendance.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!attendance;
  }
}
