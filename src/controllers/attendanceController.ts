import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService, CreateAttendanceDTO, UpdateAttendanceDTO, AttendanceFilter } from '@/services/attendanceService';
import { AttendanceSessionService } from '@/services/attendanceSessionsService';
import { AuthUtils } from '@/utils/authUtils';
import {AttendanceStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const attendanceService = new AttendanceService();
const attendanceSessionService = new AttendanceSessionService();
const prisma = new PrismaClient();

export class AttendanceController {
  async createAttendance(req: NextRequest) {
    try {
      const user = await AuthUtils.getCurrentUser(req);
      if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
  
      const data = await req.json();
      const { attendanceSessionId, records } = data;
  
      if (!attendanceSessionId || !Array.isArray(records) || records.length === 0) {
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
      }
  
      const session = await attendanceSessionService.getAttendanceSessionById(attendanceSessionId);
      if (!session) return NextResponse.json({ error: 'Attendance session not found' }, { status: 404 });
      
      // Additional permissions check
      if (user.role === 'TEACHER' && user.teacher?.id !== session.teacherId) {
        return NextResponse.json({ error: 'Unauthorized to record for this session' }, { status: 403 });
      }
      if (session.status !== 'SCHEDULED' && session.status !== 'IN_PROGRESS') {
        return NextResponse.json({ error: 'Cannot record attendance for this session status' }, { status: 400 });
      }
  
      // CRITICAL CHANGE: Make sure we have a valid teacher ID
      let teacherId;
      if (user.role === 'TEACHER') {
        if (!user.teacher?.id) {
          return NextResponse.json({ error: 'Teacher profile not found for this user' }, { status: 400 });
        }
        teacherId = user.teacher.id;
      } else {
        // For ADMIN users, use the recordedById from the request if provided, otherwise use session's teacherId
        teacherId = session.teacherId;
      }
  
      const attendanceRecords: CreateAttendanceDTO[] = records.map((record: { studentId: string; status: string; remarks?: string }) => ({
        attendanceSessionId,
        studentId: record.studentId,
        status: record.status as AttendanceStatus,
        remarks: record.remarks || null,
        recordedById: teacherId, // Use the teacher ID instead of user ID
      }));
  
      const result = await attendanceService.createAttendance(attendanceRecords);
      if (session.status === 'SCHEDULED') {
        await attendanceSessionService.updateAttendanceSession(attendanceSessionId, { status: 'IN_PROGRESS' });
      }
  
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      console.error('Error recording attendance:', error);
      return NextResponse.json({ error: 'An error occurred while recording attendance' }, { status: 500 });
    }
  }

  async getAttendanceRecords(req: NextRequest) {
    try {
      const user = await AuthUtils.getCurrentUser(req);
      if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

      const url = new URL(req.url);
      const filters: AttendanceFilter = {
        attendanceSessionId: url.searchParams.get('attendanceSessionId') || undefined,
        studentId: url.searchParams.get('studentId') || undefined,
        classSectionId: url.searchParams.get('classSectionId') || undefined,
        fromDate: url.searchParams.get('fromDate') ? new Date(url.searchParams.get('fromDate')!) : undefined,
        toDate: url.searchParams.get('toDate') ? new Date(url.searchParams.get('toDate')!) : undefined,
      };

      if (user.role === 'STUDENT') filters.studentId = user.student?.id;
      if (user.role === 'TEACHER' && !filters.attendanceSessionId && !filters.classSectionId) {
        return NextResponse.json({ error: 'Teachers must specify session or class section' }, { status: 400 });
      }

      const records = await attendanceService.getAttendanceRecords(filters);
      return NextResponse.json(records);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      return NextResponse.json({ error: 'An error occurred while fetching attendance records' }, { status: 500 });
    }
  }

  async updateAttendance(id: string, req: NextRequest) {
    try {
      const user = await AuthUtils.getCurrentUser(req);
      if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
  
      const record = await attendanceService.getAttendanceById(id);
      if (!record) return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
  
      const session = await attendanceSessionService.getAttendanceSessionById(record.attendanceSessionId);
      if (!session) return NextResponse.json({ error: 'Attendance session not found' }, { status: 404 });
      
      if (user.role === 'TEACHER' && user.teacher?.id !== session.teacherId) {
        return NextResponse.json({ error: 'Unauthorized to update this record' }, { status: 403 });
      }
  
      // Get the proper teacher ID
      let teacherId;
      if (user.role === 'TEACHER') {
        if (!user.teacher?.id) {
          return NextResponse.json({ error: 'Teacher profile not found for this user' }, { status: 400 });
        }
        teacherId = user.teacher.id;
      } else {
        // For ADMIN, keep the current teacher who recorded it or use the session's teacher
        teacherId = record.recordedById || session.teacherId;
      }
  
      const data = await req.json();
      const updateData: UpdateAttendanceDTO = {
        status: data.status,
        remarks: data.remarks,
        recordedById: teacherId, // Use teacher ID instead of user ID
      };
  
      const updatedRecord = await attendanceService.updateAttendance(id, updateData);
      return NextResponse.json(updatedRecord);
    } catch (error) {
      console.error(`Error updating attendance ${id}:`, error);
      return NextResponse.json({ error: 'An error occurred while updating attendance' }, { status: 500 });
    }
  }

  async getStudentCourseAttendance(req: NextRequest, studentId: string, courseId: string) {
    try {
      const user = await AuthUtils.getCurrentUser(req);
      if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

      // Security check: If student, can only access their own attendance
      if (user.role === 'STUDENT' && user.student?.id !== studentId) {
        return NextResponse.json({ error: 'Unauthorized to access this student\'s attendance' }, { status: 403 });
      }

      // Get all attendance sessions for this course
      const sessions = await prisma.attendanceSession.findMany({
        where: {
          courseId: courseId,
          // Only include past sessions
          sessionDate: {
            lte: new Date(),
          },
          // Exclude cancelled sessions
          status: {
            not: 'CANCELLED',
          }
        },
        select: {
          id: true,
        },
      });

      const sessionIds = sessions.map(s => s.id);
      
      if (sessionIds.length === 0) {
        return NextResponse.json({
          totalSessions: 0,
          presentSessions: 0,
          absentSessions: 0,
          lateSessions: 0,
          attendancePercentage: 0,
        });
      }

      // Get attendance records for this student for these sessions
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          studentId: studentId,
          attendanceSessionId: {
            in: sessionIds,
          },
        },
        select: {
          status: true,
        },
      });

      // Calculate statistics
      const totalSessions = sessionIds.length;
      const presentSessions = attendanceRecords.filter(r => r.status === 'PRESENT').length;
      const absentSessions = attendanceRecords.filter(r => r.status === 'ABSENT').length;
      const lateSessions = attendanceRecords.filter(r => r.status === 'LATE').length;
      
      // For attendance percentage calculation, count LATE as present
      const attendancePercentage = totalSessions > 0 
        ? Math.round(((presentSessions + lateSessions) / totalSessions) * 100) 
        : 0;

      return NextResponse.json({
        totalSessions,
        presentSessions,
        absentSessions,
        lateSessions,
        attendancePercentage,
      });
    } catch (error) {
      console.error('Error calculating student course attendance:', error);
      return NextResponse.json({ error: 'An error occurred while calculating attendance' }, { status: 500 });
    }
  }
}