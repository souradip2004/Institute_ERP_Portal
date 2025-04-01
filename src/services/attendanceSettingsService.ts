import prisma from '@/config/prisma';
import { AttendanceSettings } from '@prisma/client';

export interface CreateAttendanceSettingsDTO {
  minimumAttendancePercentage?: number;
  autoLockAttendance?: boolean;
  autoLockAfterHours?: number;
  allowExcusedAbsences?: boolean;
}

export interface UpdateAttendanceSettingsDTO {
  minimumAttendancePercentage?: number;
  autoLockAttendance?: boolean;
  autoLockAfterHours?: number;
  allowExcusedAbsences?: boolean;
}

export class AttendanceSettingsService {
  async getAttendanceSettings(institutionId: string): Promise<AttendanceSettings | null> {
    return prisma.attendanceSettings.findFirst({ where: { institutionId } });
  }

  async createAttendanceSettings(institutionId: string, data: CreateAttendanceSettingsDTO): Promise<AttendanceSettings> {
    const existing = await this.checkSettingsExist(institutionId);
    if (existing) throw new Error('Attendance settings already exist for this institution');

    return prisma.attendanceSettings.create({
      data: {
        institutionId,
        minimumAttendancePercentage: data.minimumAttendancePercentage ?? 75,
        autoLockAttendance: data.autoLockAttendance ?? false,
        autoLockAfterHours: data.autoLockAfterHours ?? 24,
        allowExcusedAbsences: data.allowExcusedAbsences ?? true,
      },
    });
  }

  async updateAttendanceSettings(institutionId: string, data: UpdateAttendanceSettingsDTO): Promise<AttendanceSettings> {
    const existing = await this.getAttendanceSettings(institutionId);
    if (!existing) return this.createAttendanceSettings(institutionId, data);

    return prisma.attendanceSettings.update({
      where: { id: existing.id },
      data: {
        minimumAttendancePercentage: data.minimumAttendancePercentage,
        autoLockAttendance: data.autoLockAttendance,
        autoLockAfterHours: data.autoLockAfterHours,
        allowExcusedAbsences: data.allowExcusedAbsences,
        updatedAt: new Date(),
      },
    });
  }

  async checkSettingsExist(institutionId: string): Promise<boolean> {
    const settings = await prisma.attendanceSettings.findFirst({ where: { institutionId }, select: { id: true } });
    return !!settings;
  }
}