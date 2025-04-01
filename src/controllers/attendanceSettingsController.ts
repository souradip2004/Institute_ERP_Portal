import { NextRequest, NextResponse } from 'next/server';
import { AttendanceSettingsService, CreateAttendanceSettingsDTO, UpdateAttendanceSettingsDTO } from '@/services/attendanceSettingsService';
import { AuthUtils } from '@/utils/authUtils';

const attendanceSettingsService = new AttendanceSettingsService();

export class AttendanceSettingsController {
  async getAttendanceSettings(req: NextRequest) {
    try {
      const user = await AuthUtils.getCurrentUser();
      if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

      const institutionId = user.institutionId;
      if (!institutionId) return NextResponse.json({ error: 'Institution ID required' }, { status: 400 });

      const settings = await attendanceSettingsService.getAttendanceSettings(institutionId);
      if (!settings) return NextResponse.json({ error: 'Attendance settings not found' }, { status: 404 });

      return NextResponse.json(settings);
    } catch (error) {
      console.error('Error fetching attendance settings:', error);
      return NextResponse.json({ error: 'An error occurred while fetching attendance settings' }, { status: 500 });
    }
  }

  async createAttendanceSettings(req: NextRequest) {
    try {
      const user = await AuthUtils.getCurrentUser();
      if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

      const institutionId = user.institutionId;
      if (!institutionId) return NextResponse.json({ error: 'Institution ID required' }, { status: 400 });

      const data = await req.json();
      if (!data) return NextResponse.json({ error: 'No settings data provided' }, { status: 400 });

      // Check if settings already exist
      const existingSettings = await attendanceSettingsService.getAttendanceSettings(institutionId);
      if (existingSettings) {
        return NextResponse.json({ error: 'Attendance settings already exist for this institution' }, { status: 409 });
      }

      const createData: CreateAttendanceSettingsDTO = {
        minimumAttendancePercentage: data.minimumAttendancePercentage,
        autoLockAttendance: data.autoLockAttendance,
        autoLockAfterHours: data.autoLockAfterHours,
        allowExcusedAbsences: data.allowExcusedAbsences,
      };

      const newSettings = await attendanceSettingsService.createAttendanceSettings(institutionId, createData);
      return NextResponse.json(newSettings, { status: 201 });
    } catch (error) {
      console.error('Error creating attendance settings:', error);
      return NextResponse.json({ error: 'An error occurred while creating attendance settings' }, { status: 500 });
    }
  }

  async updateAttendanceSettings(req: NextRequest) {
    try {
      const user = await AuthUtils.getCurrentUser();
      if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

      const institutionId = user.institutionId;
      if (!institutionId) return NextResponse.json({ error: 'Institution ID required' }, { status: 400 });

      const data = await req.json();
      if (!data) return NextResponse.json({ error: 'No settings data provided' }, { status: 400 });

      const updateData: UpdateAttendanceSettingsDTO = {
        minimumAttendancePercentage: data.minimumAttendancePercentage,
        autoLockAttendance: data.autoLockAttendance,
        autoLockAfterHours: data.autoLockAfterHours,
        allowExcusedAbsences: data.allowExcusedAbsences,
      };

      const updatedSettings = await attendanceSettingsService.updateAttendanceSettings(institutionId, updateData);
      return NextResponse.json(updatedSettings);
    } catch (error) {
      console.error('Error updating attendance settings:', error);
      return NextResponse.json({ error: 'An error occurred while updating attendance settings' }, { status: 500 });
    }
  }
}