import { NextRequest, NextResponse } from 'next/server';
import { AttendanceSettingsService, CreateAttendanceSettingsDTO, UpdateAttendanceSettingsDTO } from '@/services/attendanceSettingsService';
import { AuthUtils } from '@/utils/authUtils';

const attendanceSettingsService = new AttendanceSettingsService();

// Custom error type for try/catch blocks
interface ServiceError extends Error {
  message: string;
}

export class AttendanceSettingsController {
  async getAttendanceSettings(req: NextRequest) {
    try {
      // Verify user is authenticated
      const user = await AuthUtils.getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      // Only admins can view attendance settings
      if (user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized. Only administrators can view attendance settings' }, { status: 403 });
      }
      
      const institutionId = user.institutionId;
      if (!institutionId) {
        return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 });
      }
      if (!institutionId) {
        return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 });
      }
      const settings = await attendanceSettingsService.getAttendanceSettings(institutionId);
      
      if (!settings) {
        return NextResponse.json({ error: 'Attendance settings not found' }, { status: 404 });
      }
      
      return NextResponse.json(settings);
      
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      //console.error('Error fetching attendance settings:', serviceError);
      return NextResponse.json({ error: serviceError.message || 'An error occurred while fetching attendance settings' }, { status: 500 });
    }
  }
  
  async createAttendanceSettings(req: NextRequest) {
    try {
      // Verify user is authenticated
      const user = await AuthUtils.getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      // Only admins can create attendance settings
      if (user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized. Only administrators can create attendance settings' }, { status: 403 });
      }
      
      const data = await req.json();
      //console.log('Data received for creating attendance settings:', data);
      const institutionId = user.institutionId;
      //console.log('Institution ID:', institutionId);
      
      // Basic validation
      if (!data) {
        return NextResponse.json({ error: 'No settings data provided' }, { status: 400 });
      }
      
      // Validate fields
      if (data.minimumAttendancePercentage !== undefined && 
          (data.minimumAttendancePercentage < 0 || data.minimumAttendancePercentage > 100)) {
        return NextResponse.json({ 
          error: 'Minimum attendance percentage must be between 0 and 100' 
        }, { status: 400 });
      }
      
      if (data.autoLockAfterHours !== undefined && data.autoLockAfterHours < 0) {
        return NextResponse.json({ 
          error: 'Auto lock after hours must be a positive number' 
        }, { status: 400 });
      }
      
      const settingsData: CreateAttendanceSettingsDTO = {
        minimumAttendancePercentage: data.minimumAttendancePercentage,
        autoLockAttendance: data.autoLockAttendance,
        autoLockAfterHours: data.autoLockAfterHours,
        allowExcusedAbsences: data.allowExcusedAbsences
      };
      
      try {
        if (!institutionId) {
          return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 });
        }
        const newSettings = await attendanceSettingsService.createAttendanceSettings(institutionId, settingsData);
        //console.log('New attendance settings created:', newSettings);
        return NextResponse.json(newSettings, { status: 201 }); // 201 Created
      } catch (error: unknown) {
        const serviceError = error as ServiceError;
        if (serviceError.message.includes('already exist')) {
          return NextResponse.json({ error: serviceError.message }, { status: 409 }); // 409 Conflict
        }
        throw serviceError; // Re-throw to be caught by outer catch
      }
      
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error('Error creating attendance settings:', serviceError);
      return NextResponse.json({ error: serviceError.message || 'An error occurred while creating attendance settings' }, { status: 500 });
    }
  }
  
  async updateAttendanceSettings(req: NextRequest) {
    try {
      // Verify user is authenticated
      const user = await AuthUtils.getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      // Only admins can update attendance settings
      if (user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized. Only administrators can update attendance settings' }, { status: 403 });
      }
      
      const data = await req.json();
      const institutionId = user.institutionId;
      
      // Basic validation
      if (!data) {
        return NextResponse.json({ error: 'No settings data provided' }, { status: 400 });
      }
      
      // Validate fields
      if (data.minimumAttendancePercentage !== undefined && 
          (data.minimumAttendancePercentage < 0 || data.minimumAttendancePercentage > 100)) {
        return NextResponse.json({ 
          error: 'Minimum attendance percentage must be between 0 and 100' 
        }, { status: 400 });
      }
      
      if (data.autoLockAfterHours !== undefined && data.autoLockAfterHours < 0) {
        return NextResponse.json({ 
          error: 'Auto lock after hours must be a positive number' 
        }, { status: 400 });
      }
      
      const updateData: UpdateAttendanceSettingsDTO = {
        minimumAttendancePercentage: data.minimumAttendancePercentage,
        autoLockAttendance: data.autoLockAttendance,
        autoLockAfterHours: data.autoLockAfterHours,
        allowExcusedAbsences: data.allowExcusedAbsences
      };
      
      if (!institutionId) {
        return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 });
      }
      const updatedSettings = await attendanceSettingsService.updateAttendanceSettings(institutionId, updateData);
      return NextResponse.json(updatedSettings);
      
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error('Error updating attendance settings:', serviceError);
      return NextResponse.json({ error: serviceError.message || 'An error occurred while updating attendance settings' }, { status: 500 });
    }
  }
  
  async checkSettingsExist(institutionId: string) {
    try {
      const exists = await attendanceSettingsService.checkSettingsExist(institutionId);
      return NextResponse.json({ exists });
      
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error(`Error checking if settings exist for institution ${institutionId}:`, serviceError);
      return NextResponse.json({ error: serviceError.message || 'An error occurred while checking settings existence' }, { status: 500 });
    }
  }
}