import { NextRequest, NextResponse } from 'next/server';
import { AttendanceSessionService, CreateAttendanceSessionDTO, UpdateAttendanceSessionDTO, AttendanceSessionFilter } from '@/services/attendanceSessionsService';
import { AuthUtils } from '@/utils/authUtils';
import { Status } from '@prisma/client';

const attendanceSessionService = new AttendanceSessionService();

// Custom error type for try/catch blocks
interface ServiceError extends Error {
  message: string;
}

export class AttendanceSessionController {
  async createAttendanceSession(req: NextRequest) {
    try {
      // Verify user is authenticated and is a teacher
      const user = await AuthUtils.getCurrentUser();
      //console.log("Here is user",user);
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      if (user.role !== 'TEACHER' && user.role !== 'DEPARTMENT_HEAD' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized. Only teachers can create attendance sessions' }, { status: 403 });
      }
      
      const data = await req.json();
      //console.log('Received data:', data);
      
      // Validate required fields
      const requiredFields = ['classSectionId', 'teacherId', 'sessionDate', 'startTime', 'endTime', 'sessionType'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
        }
      }
      
      // Convert string dates to Date objects
      const sessionDate = new Date(data.sessionDate);
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      
      if (isNaN(sessionDate.getTime()) || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
      }
      
      if (startTime >= endTime) {
        return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 });
      }
      
      // Check if teacher is creating for themselves
      if (user.role === 'TEACHER' && user.teacher?.id !== data.teacherId) {
        return NextResponse.json({ error: 'Teachers can only create sessions for themselves' }, { status: 403 });
      }
      
      const sessionData: CreateAttendanceSessionDTO = {
        classSectionId: data.classSectionId,
        teacherId: data.teacherId,
        sessionDate,
        startTime,
        endTime,
        sessionType: data.sessionType,
        status: data.status || 'scheduled'
      };
      
      const session = await attendanceSessionService.createAttendanceSession(sessionData);
      console.log('Attendance session created:', session);
      return NextResponse.json(session, { status: 201 });
      
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error('Error creating attendance session:', serviceError);
      return NextResponse.json({ error: serviceError.message || 'An error occurred while creating the attendance session' }, { status: 500 });
    }
  }
  
  async getAttendanceSessions(req: NextRequest) {
    try {
      // Verify user is authenticated
      const user = await AuthUtils.getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      // Parse query parameters
      const url = new URL(req.url);
      const teacherId = url.searchParams.get('teacherId') || undefined;
      const classSectionId = url.searchParams.get('classSectionId') || undefined;
      const statusParam = url.searchParams.get('status');
      const status = statusParam ? (statusParam as Status) : undefined;
      const fromDateStr = url.searchParams.get('fromDate');
      const toDateStr = url.searchParams.get('toDate');
      
      const fromDate = fromDateStr ? new Date(fromDateStr) : undefined;
      const toDate = toDateStr ? new Date(toDateStr) : undefined;
      
      // Apply role-based filtering
      const filters: AttendanceSessionFilter = { 
        teacherId, 
        classSectionId, 
        status, 
        fromDate, 
        toDate 
      };
      
      // Regular teachers can only see their own sessions
      if (user.role === 'TEACHER' && user.teacher?.id) {
        filters.teacherId = user.teacher.id;
      }
      
      // Students can only see sessions for classes they're enrolled in
      if (user.role === 'STUDENT') {
        // This would require a more complex query to get all classSections the student is enrolled in
        // For simplicity, we're requiring students to specify a classSectionId
        if (!classSectionId) {
          return NextResponse.json({ error: 'Class section ID is required for students' }, { status: 400 });
        }
        
        // Check if student is enrolled in this class section
        const isEnrolled = await AuthUtils.isStudentEnrolledInClassSection(user.student?.id as string, classSectionId);
        if (!isEnrolled) {
          return NextResponse.json({ error: 'You are not enrolled in this class section' }, { status: 403 });
        }
      }
      
      const sessions = await attendanceSessionService.getAttendanceSessions(filters);
      return NextResponse.json(sessions);
      
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error('Error fetching attendance sessions:', serviceError);
      return NextResponse.json({ error: serviceError.message || 'An error occurred while fetching attendance sessions' }, { status: 500 });
    }
  }
  
  async getAttendanceSessionById(id: string) {
    try {
      const session = await attendanceSessionService.getAttendanceSessionById(id);
      
      if (!session) {
        return NextResponse.json({ error: 'Attendance session not found' }, { status: 404 });
      }
      
      return NextResponse.json(session);
      
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error(`Error fetching attendance session with ID ${id}:`, serviceError);
      return NextResponse.json({ error: serviceError.message || 'An error occurred while fetching the attendance session' }, { status: 500 });
    }
  }
  
  async updateAttendanceSession(id: string, req: NextRequest) {
    try {
      // Verify user is authenticated
      const user = await AuthUtils.getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      // Check if session exists
      const sessionExists = await attendanceSessionService.checkSessionExists(id);
      if (!sessionExists) {
        return NextResponse.json({ error: 'Attendance session not found' }, { status: 404 });
      }
      
      // Get session details to check authorization
      const session = await attendanceSessionService.getAttendanceSessionById(id);
      
      // Authorization checks
      if (user.role === 'TEACHER') {
        // Teachers can only update their own sessions
        if (user.teacher?.id !== session?.teacherId) {
          return NextResponse.json({ error: 'You can only update your own attendance sessions' }, { status: 403 });
        }
      } else if (user.role !== 'DEPARTMENT_HEAD' && user.role !== 'ADMIN') {
        // Only teachers, department heads, and admins can update sessions
        return NextResponse.json({ error: 'Unauthorized to update attendance sessions' }, { status: 403 });
      }
      
      const data = await req.json();
      
      // Process dates if provided
      if (data.sessionDate) {
        data.sessionDate = new Date(data.sessionDate);
        if (isNaN(data.sessionDate.getTime())) {
          return NextResponse.json({ error: 'Invalid session date format' }, { status: 400 });
        }
      }
      
      if (data.startTime) {
        data.startTime = new Date(data.startTime);
        if (isNaN(data.startTime.getTime())) {
          return NextResponse.json({ error: 'Invalid start time format' }, { status: 400 });
        }
      }
      
      if (data.endTime) {
        data.endTime = new Date(data.endTime);
        if (isNaN(data.endTime.getTime())) {
          return NextResponse.json({ error: 'Invalid end time format' }, { status: 400 });
        }
      }
      
      if (data.startTime && data.endTime && data.startTime >= data.endTime) {
        return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 });
      }
      
      const updateData: UpdateAttendanceSessionDTO = {
        status: data.status,
        sessionDate: data.sessionDate,
        startTime: data.startTime,
        endTime: data.endTime,
        sessionType: data.sessionType
      };
      
      const updatedSession = await attendanceSessionService.updateAttendanceSession(id, updateData);
      return NextResponse.json(updatedSession);
      
    } catch (error: unknown) {
      const serviceError = error as ServiceError;
      console.error(`Error updating attendance session with ID ${id}:`, serviceError);
      return NextResponse.json({ error: serviceError.message || 'An error occurred while updating the attendance session' }, { status: 500 });
    }
  }
}