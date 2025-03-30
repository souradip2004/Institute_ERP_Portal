import prisma from '@/config/prisma';
//import { from } from '@apollo/client';
import { AttendanceSession, Status, SessionType, Prisma } from '@prisma/client';

export interface CreateAttendanceSessionDTO {
    classSectionId: string;
    teacherId: string;
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
    classSectionId?: string;
    status?: Status;
    fromDate?: Date;
    toDate?: Date;
}

export class AttendanceSessionService {
    async createAttendanceSession(data: CreateAttendanceSessionDTO): Promise<AttendanceSession> {
        return prisma.attendanceSession.create({
            data:{
                classSectionId: data.classSectionId,
                teacherId: data.teacherId,
                sessionDate: data.sessionDate,
                startTime: data.startTime,
                endTime: data.endTime,
                sessionType: data.sessionType,
                status: data.status || 'scheduled'
            }
        });
    }

    async getAttendanceSessions(filters: AttendanceSessionFilter): Promise<AttendanceSession[]> {
        const { teacherId, classSectionId, status, fromDate, toDate } = filters;
        
        const where: Prisma.AttendanceSessionWhereInput = {};
        
        if (teacherId) where.teacherId = teacherId;
        if (classSectionId) where.classSectionId = classSectionId;
        if (status) where.status = status;
        
        if (fromDate || toDate) {
          where.sessionDate = {};
          if (fromDate) where.sessionDate.gte = fromDate;
          if (toDate) where.sessionDate.lte = toDate;
        }
        
        return prisma.attendanceSession.findMany({
          where,
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true,
                teacherId: true
              }
            },
            classSection: {
              select: {
                sectionName: true,
                course: {
                  select: {
                    name: true,
                    courseCode: true
                  }
                }
              }
            }
          },
          orderBy: {
            sessionDate: 'desc'
          }
        });
      }
    
      async getAttendanceSessionById(id: string): Promise<AttendanceSession | null> {
        return prisma.attendanceSession.findUnique({
          where: { id },
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true,
                teacherId: true
              }
            },
            classSection: {
              select: {
                sectionName: true,
                course: {
                  select: {
                    name: true,
                    courseCode: true
                  }
                },
                studentEnrollments: {
                  include: {
                    student: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        studentId: true
                      }
                    }
                  }
                }
              }
            },
            attendanceRecords: true
          }
        });
      }
    
      async updateAttendanceSession(id: string, data: UpdateAttendanceSessionDTO): Promise<AttendanceSession> {
        return prisma.attendanceSession.update({
          where: { id },
          data
        });
      }
    
      async checkSessionExists(id: string): Promise<boolean> {
        const session = await prisma.attendanceSession.findUnique({
          where: { id },
          select: { id: true }
        });
        return !!session;
      }
    
      async checkTeacherAuthorization(sessionId: string, teacherId: string): Promise<boolean> {
        const session = await prisma.attendanceSession.findUnique({
          where: { id: sessionId },
          select: { teacherId: true }
        });
        return session?.teacherId === teacherId;
      }
}
