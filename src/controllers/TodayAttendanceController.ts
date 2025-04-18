// File: controllers/TodayAttendanceController.ts
import { TodayAttendanceService } from '@/services/TodayAttendanceService';
import { TodayClass } from '@/types/dashboard';

export class TodayAttendanceController {
  async getStudentTodaySessions(studentId: string, date: string): Promise<TodayClass[]> {
    const service = new TodayAttendanceService();
    return await service.getStudentTodaySessions(studentId, date);
  }
}