import { NextResponse } from 'next/server';
import { PrismaClient, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

type DailyAttendanceStatus = AttendanceStatus | 'NOT_MARKED';

export async function GET(request: Request) {
  // 1. Extract and validate mandatory parameters
  const { searchParams } = new URL(request.url);
  const classSectionId = searchParams.get('classSectionId');
  const dateParam = searchParams.get('date'); // Expects 'YYYY-MM-DD' format

  if (!classSectionId || !dateParam) {
    return NextResponse.json(
      { error: 'classSectionId and date (in YYYY-MM-DD format) are required parameters.' },
      { status: 400 }
    );
  }

  const requestDate = new Date(dateParam);
  if (isNaN(requestDate.getTime())) {
    return NextResponse.json(
      { error: 'Invalid date format. Please use YYYY-MM-DD.' },
      { status: 400 }
    );
  }

  try {
    // 2. NEW: Find the very first session to determine the valid start date
    const firstSession = await prisma.attendanceSession.findFirst({
      where: { classSectionId: classSectionId },
      orderBy: { sessionDate: 'asc' }, // Get the earliest session
      select: { sessionDate: true },
    });

    // Handle case where this class section has NO sessions scheduled at all
    if (!firstSession) {
      return NextResponse.json(
        { message: 'This class section has no attendance sessions scheduled yet.' },
        { status: 404 }
      );
    }

    // Normalize dates to compare only the day, ignoring time
    const startDateOfSessions = new Date(firstSession.sessionDate);
    startDateOfSessions.setUTCHours(0, 0, 0, 0);
    requestDate.setUTCHours(0, 0, 0, 0);

    // Handle case where the requested date is before the first session date
    if (requestDate < startDateOfSessions) {
      const formattedStartDate = startDateOfSessions.toISOString().split('T')[0];
      return NextResponse.json(
        { message: `The requested date is before the first session date of ${formattedStartDate}.` },
        { status: 400 } // 400 Bad Request is appropriate for an invalid parameter
      );
    }

    // 3. Proceed to find the specific session for the requested (and now validated) date
    // Create a date range for the entire day to ensure we find the session
    const dayStart = new Date(dateParam);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayStart.getUTCDate() + 1);

    const sessionForDay = await prisma.attendanceSession.findFirst({
      where: {
        classSectionId: classSectionId,
        sessionDate: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      include: {
        course: { select: { name: true } },
        classSection: { select: { sectionName: true } },
        attendanceRecords: {
          select: {
            studentId: true,
            status: true,
          },
        },
      },
    });

    // Handle case where a session was expected but not found on this specific day
    if (!sessionForDay) {
      return NextResponse.json(
        { message: 'No attendance session was scheduled for this class on the specified date.' },
        { status: 404 }
      );
    }

    // 4. If a session exists for the day, get all enrolled students
    const enrolledStudents = await prisma.studentClassEnrollment.findMany({
      where: { classSectionId: classSectionId },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            performanceMetrics: {
              where: { classSectionId: classSectionId },
            },
          },
        },
      },
      orderBy: { student: { studentRoll: 'asc' } }
    });

    // 5. Create a fast lookup map for the day's attendance
    const attendanceStatusMap = new Map<string, AttendanceStatus>();
    sessionForDay.attendanceRecords.forEach(record => {
      attendanceStatusMap.set(record.studentId, record.status);
    });

    // 6. Combine student list with their attendance status
    const studentDetailsList = enrolledStudents.map(({ student }) => {
      const performance = student.performanceMetrics[0];
      const status: DailyAttendanceStatus = attendanceStatusMap.get(student.id) || 'NOT_MARKED';

      return {
        studentId: student.id,
        studentName: student.user.name,
        studentRoll: student.studentRoll,
        todaysStatus: status,
        overallAttendancePercentage: performance ? performance.attendancePercentage : null,
      };
    });

    // 7. Construct the final response
    const responseData = {
      sessionStartDate: firstSession.sessionDate.toISOString().split('T')[0],
      classSectionName: sessionForDay.classSection.sectionName,
      courseName: sessionForDay.course.name,
      date: dateParam,
      students: studentDetailsList,
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch daily class attendance:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}