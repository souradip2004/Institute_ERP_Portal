import { NextRequest, NextResponse } from 'next/server';
import { AttendanceSessionService, CreateAttendanceSessionDTO, UpdateAttendanceSessionDTO, AttendanceSessionFilter } from '@/services/attendanceSessionsService';
import { Status } from '@prisma/client';
import { AuthUtils } from '@/utils/authUtils';

const attendanceSessionService = new AttendanceSessionService();

export class AttendanceSessionController {
  async createAttendanceSession(req: NextRequest) {
    try {
      const user = await AuthUtils.getCurrentUser(req);
      if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized. Only teachers or admins can create sessions' }, { status: 403 });
      }

      const data = await req.json();
      const { classSectionId, teacherId, sessionDate, startTime, endTime, sessionType, status } = data;

      if (!classSectionId || !teacherId || !sessionDate || !startTime || !endTime || !sessionType) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      if (user.role === 'TEACHER' && user.teacher?.id !== teacherId) {
        return NextResponse.json({ error: 'Teachers can only create sessions for themselves' }, { status: 403 });
      }

      const sessionData: CreateAttendanceSessionDTO = {
        classSectionId,
        teacherId,
        sessionDate: new Date(sessionDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        sessionType,
        status,
      };

      if (sessionData.startTime >= sessionData.endTime) {
        return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 });
      }

      const session = await attendanceSessionService.createAttendanceSession(sessionData);
      return NextResponse.json(session, { status: 201 });
    } catch (error) {
      console.error('Error creating attendance session:', error);
      return NextResponse.json({ error: 'An error occurred while creating the attendance session' }, { status: 500 });
    }
  }

  async getAttendanceSessions(req: NextRequest) {
    try {
      const user = await AuthUtils.getCurrentUser(req);
      if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

      const url = new URL(req.url);
      const filters: AttendanceSessionFilter = {
        teacherId: url.searchParams.get('teacherId') || undefined,
        classSectionId: url.searchParams.get('classSectionId') || undefined,
        status: url.searchParams.get('status') as Status | undefined,
        fromDate: url.searchParams.get('fromDate') ? new Date(url.searchParams.get('fromDate')!) : undefined,
        toDate: url.searchParams.get('toDate') ? new Date(url.searchParams.get('toDate')!) : undefined,
      };

      if (user.role === 'TEACHER') filters.teacherId = user.teacher?.id;
      if (user.role === 'STUDENT' && !filters.classSectionId) {
        return NextResponse.json({ error: 'Class section ID required for students' }, { status: 400 });
      }

      const sessions = await attendanceSessionService.getAttendanceSessions(filters);
      return NextResponse.json(sessions);
    } catch (error) {
      console.error('Error fetching attendance sessions:', error);
      return NextResponse.json({ error: 'An error occurred while fetching attendance sessions' }, { status: 500 });
    }
  }

  async getAttendanceSessionById(id: string, req?: NextRequest) {
    try {
      if (req) {
        const user = await AuthUtils.getCurrentUser(req);
        if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      const session = await attendanceSessionService.getAttendanceSessionById(id);
      if (!session) return NextResponse.json({ error: 'Attendance session not found' }, { status: 404 });
      return NextResponse.json(session);
    } catch (error) {
      console.error(`Error fetching attendance session ${id}:`, error);
      return NextResponse.json({ error: 'An error occurred while fetching the attendance session' }, { status: 500 });
    }
  }

  async updateAttendanceSession(id: string, req: NextRequest) {
    try {
      const user = await AuthUtils.getCurrentUser(req);
      if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const session = await attendanceSessionService.getAttendanceSessionById(id);
      if (!session) return NextResponse.json({ error: 'Attendance session not found' }, { status: 404 });
      if (user.role === 'TEACHER' && user.teacher?.id !== session.teacherId) {
        return NextResponse.json({ error: 'Teachers can only update their own sessions' }, { status: 403 });
      }

      const data = await req.json();
      const updateData: UpdateAttendanceSessionDTO = {
        status: data.status,
        sessionDate: data.sessionDate ? new Date(data.sessionDate) : undefined,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        sessionType: data.sessionType,
      };

      if (updateData.startTime && updateData.endTime && updateData.startTime >= updateData.endTime) {
        return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 });
      }

      const updatedSession = await attendanceSessionService.updateAttendanceSession(id, updateData);
      return NextResponse.json(updatedSession);
    } catch (error) {
      console.error(`Error updating attendance session ${id}:`, error);
      return NextResponse.json({ error: 'An error occurred while updating the attendance session' }, { status: 500 });
    }
  }
}