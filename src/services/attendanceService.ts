import prisma from '@/config/prisma';
import { Attendance, AttendanceStatus, Prisma } from '@prisma/client';

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
  recordedById: string;
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
        // Check if record exists
        const existing = await tx.attendance.findFirst({
          where: {
            AND: [
              { attendanceSessionId: record.attendanceSessionId },
              { studentId: record.studentId }
            ]
          }
        });
        
        let result;
        if (existing) {
          // Update
          result = await tx.attendance.update({
            where: { id: existing.id },
            data: {
              status: record.status,
              remarks: record.remarks,
              recordedById: record.recordedById,
              recordedAt: now,
              updatedAt: now
            }
          });
        } else {
          // Create
          result = await tx.attendance.create({
            data: {
              attendanceSessionId: record.attendanceSessionId,
              studentId: record.studentId,
              status: record.status,
              remarks: record.remarks,
              recordedById: record.recordedById,
              recordedAt: now,
              updatedAt: now
            }
          });
        }
        
        results.push(result);
      }
      
      return results;
    });
  }

  async getAttendanceById(id: string): Promise<Attendance | null> {
    return prisma.attendance.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            studentId: true
          }
        },
        attendanceSession: {
          select: {
            sessionDate: true,
            startTime: true,
            endTime: true,
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
          }
        }
      }
    });
  }

  async updateAttendance(id: string, data: UpdateAttendanceDTO): Promise<Attendance> {
    return prisma.attendance.update({
      where: { id },
      data: {
        status: data.status,
        remarks: data.remarks,
        recordedById: data.recordedById,
        recordedAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  async getAttendanceRecords(filters: AttendanceFilter): Promise<Attendance[]> {
    const { attendanceSessionId, studentId, classSectionId, fromDate, toDate } = filters;
    
    const where: Prisma.AttendanceWhereInput = {};
    
    if (attendanceSessionId) {
      where.attendanceSessionId = attendanceSessionId;
    }
    
    if (studentId) {
      where.studentId = studentId;
    }
    
    if (classSectionId || fromDate || toDate) {
      where.attendanceSession = {};
      
      if (classSectionId) {
        where.attendanceSession.classSectionId = classSectionId;
      }
      
      if (fromDate || toDate) {
        where.attendanceSession.sessionDate = {};
        if (fromDate) where.attendanceSession.sessionDate.gte = fromDate;
        if (toDate) where.attendanceSession.sessionDate.lte = toDate;
      }
    }
    
    return prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            studentId: true
          }
        },
        attendanceSession: {
          select: {
            sessionDate: true,
            startTime: true,
            endTime: true,
            sessionType: true,
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
          }
        },
        recordedBy: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        attendanceSession: {
          sessionDate: 'desc'
        }
      }
    });
  }

  async checkAttendanceExists(id: string): Promise<boolean> {
    const attendance = await prisma.attendance.findUnique({
      where: { id },
      select: { id: true }
    });
    return !!attendance;
  }

  // async getAttendanceSettings(institutionId: string) {
  //   return prisma.attendanceSettings.findFirst({
  //     where: { institutionId }
  //   });
  // }

  // async updateAttendanceSettings(institutionId: string, data: any) {
  //   return prisma.attendanceSettings.upsert({
  //     where: { 
  //       institutionId
  //     },
  //     update: data,
  //     create: {
  //       ...data,
  //       institutionId
  //     }
  //   });
  // }
}