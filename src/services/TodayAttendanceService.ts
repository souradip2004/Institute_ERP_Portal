// File: services/TodayAttendanceService.ts
import { PrismaClient } from '@prisma/client';
import { TodayClass } from '@/types/dashboard';

export class TodayAttendanceService {
  private prisma = new PrismaClient();

  async getStudentTodaySessions(studentId: string, date: string): Promise<TodayClass[]> {
    // Fetch student's class enrollments
    const enrollments = await this.prisma.studentClassEnrollment.findMany({
      where: { studentId },
      select: { classSectionId: true },
    });

    const classSectionIds = enrollments.map((e) => e.classSectionId);

    // Fetch attendance sessions for today for these class sections
    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        classSectionId: { in: classSectionIds },
        sessionDate: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lte: new Date(`${date}T23:59:59.999Z`),
        },
      },
      include: {
        course: { select: { name: true, courseCode: true } },
        teacher: { select: { user: { select: { name: true } } } },
        classSection: { select: { sectionName: true } },
      },
    });

    // Fetch attendance records for these sessions for the student
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        studentId,
        attendanceSessionId: { in: sessions.map((s) => s.id) },
      },
      select: { attendanceSessionId: true, status: true },
    });

    // Process sessions into TodayClass format
    return sessions.map((session) => {
      const record = attendanceRecords.find((r) => r.attendanceSessionId === session.id);

      return {
        id: session.id,
        courseId: session.courseId,
        courseName: session.course?.name || 'Unknown Course',
        courseCode: session.course?.courseCode || 'N/A',
        teacherName: session.teacher?.user?.name || 'Unknown Teacher',
        classSectionName: session.classSection?.sectionName || 'Unknown Section',
        sessionDate: session.sessionDate.toISOString(),
        startTime: session.startTime
          ? new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'N/A',
        endTime: session.endTime
          ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'N/A',
        sessionType: session.sessionType || 'LECTURE',
        sessionStatus: session.status,
        attendanceStatus: record ? record.status : 'NOT_RECORDED',
      };
    });
  }
}