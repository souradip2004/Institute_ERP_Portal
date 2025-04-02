import { AttendanceSettingsFormData } from '@/types/attendance.types';

export const validateAttendanceSettings = (data: AttendanceSettingsFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (data.minimumAttendancePercentage === undefined || data.minimumAttendancePercentage === null) {
    errors.minimumAttendancePercentage = 'Minimum attendance percentage is required';
  } else if (data.minimumAttendancePercentage < 0 || data.minimumAttendancePercentage > 100) {
    errors.minimumAttendancePercentage = 'Percentage must be between 0 and 100';
  }
  
  if (data.autoLockAttendance && (data.autoLockAfterHours === undefined || data.autoLockAfterHours === null)) {
    errors.autoLockAfterHours = 'Auto-lock hours is required when auto-lock is enabled';
  } else if (data.autoLockAfterHours !== undefined && data.autoLockAfterHours < 0) {
    errors.autoLockAfterHours = 'Hours must be a positive number';
  }
  
  return errors;
};