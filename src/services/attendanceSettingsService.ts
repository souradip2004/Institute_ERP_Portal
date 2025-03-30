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
    return prisma.attendanceSettings.findFirst({
      where: { institutionId }
    });
  }

  async createAttendanceSettings(institutionId: string, data: CreateAttendanceSettingsDTO): Promise<AttendanceSettings> {
    // Check if settings already exist for this institution
    const existingSettings = await this.checkSettingsExist(institutionId);
    //console.log("Existing settings in createAttendanceSettings", existingSettings);

    if (existingSettings) {
      throw new Error('Attendance settings already exist for this institution');
    }

    // Create new settings
    return prisma.attendanceSettings.create({
      data: {
        institutionId,
        minimumAttendancePercentage: data.minimumAttendancePercentage ?? 75, // Default value
        autoLockAttendance: data.autoLockAttendance ?? false,
        autoLockAfterHours: data.autoLockAfterHours ?? 24,
        allowExcusedAbsences: data.allowExcusedAbsences ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  async updateAttendanceSettings(institutionId: string, data: UpdateAttendanceSettingsDTO): Promise<AttendanceSettings> {
    const existingSettings = await prisma.attendanceSettings.findFirst({
      where: { institutionId }
    });

    if (!existingSettings) {
      // Create new settings if they don't exist
      return this.createAttendanceSettings(institutionId, data);
    }

    // Update existing settings
    return prisma.attendanceSettings.update({
      where: { id: existingSettings.id },
      data: {
        minimumAttendancePercentage: data.minimumAttendancePercentage,
        autoLockAttendance: data.autoLockAttendance,
        autoLockAfterHours: data.autoLockAfterHours,
        allowExcusedAbsences: data.allowExcusedAbsences,
        updatedAt: new Date()
      }
    });
  }
  
  async checkSettingsExist(institutionId: string): Promise<boolean> {
    const settings = await prisma.attendanceSettings.findFirst({
      where: { institutionId },
      select: { id: true }
    });
    //console.log("Settings in checkSettingsExist", settings);
    
    return !!settings;
  }
}