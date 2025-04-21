import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type AttendanceInput = {
  attendanceSessionId: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' 
  remarks?: string;
  recordedById: string;
  recordedAt: Date;
};

export async function upsertAttendance(input: AttendanceInput) {
  const { attendanceSessionId, studentId, status, remarks, recordedById, recordedAt } = input;

  try {
    // Step 1: Check if record exists
    const existing = await prisma.attendance.findFirst({
      where: {
        attendanceSessionId,
        studentId,
      },
    });

    let attendance;

    if (existing) {
      // Step 2a: Update existing
      attendance = await prisma.attendance.update({
        where: {
          id: existing.id,
        },
        data: {
          status,
          remarks,
          recordedById,
          recordedAt,
          isLocked: false,
        },
      });
    } else {
      // Step 2b: Create new
      attendance = await prisma.attendance.create({
        data: {
          attendanceSessionId,
          studentId,
          status,
          remarks,
          recordedById,
          recordedAt,
        },
      });
    }

    return {
      success: true,
      message: existing ? 'Attendance updated successfully' : 'Attendance recorded successfully',
      data: attendance,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error processing attendance',
      error: error.message || error,
    };
  }
}
