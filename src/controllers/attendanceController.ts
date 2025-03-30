import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService, CreateAttendanceDTO, UpdateAttendanceDTO, AttendanceFilter } from '@/services/attendanceService';
import { AttendanceSessionService } from '@/services/attendanceSessionsService';
import { AuthUtils } from '@/utils/authUtils';

const attendanceService = new AttendanceService();
const attendanceSessionService = new AttendanceSessionService();

// Custom error type for try/catch blocks
interface ServiceError extends Error {
  message: string;
}

      // Map records to the format expected by the service
      interface AttendanceRecord {
        studentId: string;
        status: string;
        remarks?: string;
      }

export class AttendanceController {
  async createAttendance(req: NextRequest) {
    try {
      // Verify user is authenticated
      const user = await AuthUtils.getCurrentUser(req);
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      if (user.role !== 'TEACHER' && user.role !== 'DEPARTMENT_HEAD' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized. Only teachers, department heads, and admins can record attendance' }, { status: 403 });
      }
      
      const data = await req.json();
      
      // Validate request data
      if (!data.attendanceSessionId) {
        return NextResponse.json({ error: 'Attendance session ID is required' }, { status: 400 });
      }
      
      if (!Array.isArray(data.records) || data.records.length === 0) {
        return NextResponse.json({ error: 'Attendance records are required' }, { status: 400 });
      }
      
      // Verify the session exists
      const session = await attendanceSessionService.getAttendanceSessionById(data.attendanceSessionId);
      if (!session) {
        return NextResponse.json({ error: 'Attendance session not found' }, { status: 404 });
      }
      
      // Authorization check
      if (user.role === 'TEACHER' && user.teacher?.id !== session.teacherId) {
        return NextResponse.json({ error: 'You can only record attendance for your own sessions' }, { status: 403 });
      }
      
      // Check if the session is in progress or scheduled
      if (session.status !== 'scheduled' && session.status !== 'inProgress') {
        return NextResponse.json({ error: 'Cannot record attendance for completed or cancelled sessions' }, { status: 400 });
      }

      const attendanceRecords: CreateAttendanceDTO[] = data.records.map((record: AttendanceRecord) => ({
        attendanceSessionId: data.attendanceSessionId,
        studentId: record.studentId,
        status: record.status,
        remarks: record.remarks || null,
        recordedById: user.id
      }));
      
      // Record attendance
      const result = await attendanceService.createAttendance(attendanceRecords);
      
      // Update session status to 'inProgress' if it was 'scheduled'
      if (session.status === 'scheduled') {
        await attendanceSessionService.updateAttendanceSession(session.id, { status: 'inProgress' });
      }
      
      return NextResponse.json(result, { status: 201 });
      
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error('Error recording attendance:', serviceError);
      return NextResponse.json({ error: serviceError.message || 'An error occurred while recording attendance' }, { status: 500 });
    }
  }
  
  async getAttendanceRecords(req: NextRequest) {
    try {
      // Verify user is authenticated
      const user = await AuthUtils.getCurrentUser(req);
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      // Parse query parameters
      const url = new URL(req.url);
      const attendanceSessionId = url.searchParams.get('attendanceSessionId') || undefined;
      const studentId = url.searchParams.get('studentId') || undefined;
      const classSectionId = url.searchParams.get('classSectionId') || undefined;
      const fromDateStr = url.searchParams.get('fromDate');
      const toDateStr = url.searchParams.get('toDate');
      
      const fromDate = fromDateStr ? new Date(fromDateStr) : undefined;
      const toDate = toDateStr ? new Date(toDateStr) : undefined;
      
      // Apply role-based filtering
      const filters: AttendanceFilter = { 
        attendanceSessionId, 
        studentId,
        classSectionId, 
        fromDate, 
        toDate 
      };
      
      // Students can only see their own attendance
      if (user.role === 'STUDENT') {
        filters.studentId = user.student?.id;
      } else if (user.role === 'TEACHER') {
        // Teachers can only see attendance for sessions they teach
        if (!attendanceSessionId && !classSectionId) {
          return NextResponse.json({ error: 'Teachers must specify either session ID or class section ID' }, { status: 400 });
        }
        
        // If classSectionId is provided, verify teacher teaches this class
        if (classSectionId) {
          const teachesClass = await AuthUtils.isTeacherAssignedToClassSection(user.teacher?.id as string, classSectionId);
          if (!teachesClass) {
            return NextResponse.json({ error: 'You are not assigned to this class section' }, { status: 403 });
          }
        }
        
        // If attendanceSessionId is provided, verify teacher owns this session
        if (attendanceSessionId) {
          const session = await attendanceSessionService.getAttendanceSessionById(attendanceSessionId);
          if (session && session.teacherId !== user.teacher?.id) {
            return NextResponse.json({ error: 'You do not have access to this attendance session' }, { status: 403 });
          }
        }
      }
      
      // If studentId is provided and user is not the student or an admin
      if (studentId && user.role !== 'ADMIN' && user.role !== 'DEPARTMENT_HEAD' && 
          (user.role !== 'STUDENT' || user.student?.id !== studentId)) {
        // Check if teacher has access to this student
        if (user.role === 'TEACHER') {
          const hasAccess = await AuthUtils.doesTeacherTeachStudent(user.teacher?.id as string, studentId);
          if (!hasAccess) {
            return NextResponse.json({ error: 'You do not have access to this student\'s records' }, { status: 403 });
          }
        } else {
          return NextResponse.json({ error: 'Unauthorized to access this student\'s attendance records' }, { status: 403 });
        }
      }
      
      const attendanceRecords = await attendanceService.getAttendanceRecords(filters);
      return NextResponse.json(attendanceRecords);
      
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error('Error fetching attendance records:', serviceError);
      return NextResponse.json({ error: serviceError.message || 'An error occurred while fetching attendance records' }, { status: 500 });
    }
  }
  
  async updateAttendance(id: string, req: NextRequest) {
    try {
      // Verify user is authenticated
      const user = await AuthUtils.getCurrentUser(req);
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      if (user.role !== 'TEACHER' && user.role !== 'DEPARTMENT_HEAD' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized. Only teachers, department heads, and admins can update attendance' }, { status: 403 });
      }
      
      // Check if the attendance record exists
      const attendanceExists = await attendanceService.checkAttendanceExists(id);
      if (!attendanceExists) {
        return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
      }
      
      // Get the attendance record to check session ownership
      const record = await attendanceService.getAttendanceById(id);
      if (!record) {
        return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
      }
      
      // Get the session to check teacher authorization
      const session = await attendanceSessionService.getAttendanceSessionById(record.attendanceSessionId);
      
      // Check authorization
      if (user.role === 'TEACHER' && user.teacher?.id !== session?.teacherId) {
        return NextResponse.json({ error: 'You can only update attendance for your own sessions' }, { status: 403 });
      }
      
      const data = await req.json();
      
      const updateData: UpdateAttendanceDTO = {
        status: data.status,
        remarks: data.remarks,
        recordedById: user.id
      };
      
      const updatedAttendance = await attendanceService.updateAttendance(id, updateData);
      return NextResponse.json(updatedAttendance);
      
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error(`Error updating attendance record with ID ${id}:`, serviceError);
      return NextResponse.json({ error: serviceError.message || 'An error occurred while updating the attendance record' }, { status: 500 });
    }
  }
}