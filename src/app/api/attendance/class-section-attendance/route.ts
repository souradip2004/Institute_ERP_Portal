import {NextResponse} from 'next/server';
import {PrismaClient, AttendanceStatus} from '@prisma/client';

const prisma = new PrismaClient();

type DailyAttendanceStatus = AttendanceStatus | 'NOT_MARKED';

const getDayOfWeek = (date: Date): number => {
  // We use UTC day to be consistent with how dates are stored and compared.
  return date.getUTCDay();
}

export async function GET(request: Request) {
  // 1. Extract and validate mandatory parameters
  const {searchParams} = new URL(request.url);
  const classSectionId = searchParams.get('classSectionId');
  const dateParam = searchParams.get('date'); // Expects 'YYYY-MM-DD' format

  if (!classSectionId || !dateParam) {
    return NextResponse.json(
      {error: 'classSectionId and date (in YYYY-MM-DD format) are required parameters.'},
      {status: 400}
    );
  }

  const requestDate = new Date(dateParam);
  if (isNaN(requestDate.getTime())) {
    return NextResponse.json(
      {error: 'Invalid date format. Please use YYYY-MM-DD.'},
      {status: 400}
    );
  }

  try {
    // *** NEW: Find all sessions to determine the schedule and first session date ***
    const allSessions = await prisma.attendanceSession.findMany({
      where: {classSectionId: classSectionId},
      orderBy: {sessionDate: 'asc'},
      select: {sessionDate: true},
    });

    // Handle case where this class section has NO sessions scheduled at all
    if (allSessions.length === 0) {
      return NextResponse.json(
        {message: 'This class section has no attendance sessions scheduled yet.'},
        {status: 404}
      );
    }

    // *** NEW: Calculate the unique days of the week for the schedule ***
    const scheduledDays = [...new Set(allSessions.map(session => getDayOfWeek(session.sessionDate)))];
    const firstSession = allSessions[0];


    // Normalize dates to compare only the day, ignoring time
    const startDateOfSessions = new Date(firstSession.sessionDate);
    startDateOfSessions.setUTCHours(0, 0, 0, 0);
    requestDate.setUTCHours(0, 0, 0, 0);

    // Handle case where the requested date is before the first session date
    if (requestDate < startDateOfSessions) {
      const formattedStartDate = startDateOfSessions.toISOString().split('T')[0];
      return NextResponse.json(
        // *** MODIFIED RESPONSE ***
        {
          message: `The requested date is before the first session date of ${formattedStartDate}.`,
          scheduledDays: scheduledDays, // Include schedule info
          sessionStartDate: formattedStartDate,
        },
        {status: 400} // 400 Bad Request is appropriate for an invalid parameter
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
        course: {select: {name: true}},
        classSection: {select: {sectionName: true}},
        attendanceRecords: {
          select: {
            studentId: true,
            status: true,
          },
        },
        teacher: {
          select: {
            id: true,
            user: {select: {name: true, email: true}},
          }
        },
      },
    });

    console.log("Attendance Session: ", sessionForDay);

    // Handle case where a session was expected but not found on this specific day
    if (!sessionForDay) {
      // *** MODIFIED RESPONSE ***
      return NextResponse.json(
        {
          message: 'No attendance session was scheduled for this class on the specified date.',
          scheduledDays: scheduledDays, // Include schedule info
          sessionStartDate: firstSession.sessionDate.toISOString().split('T')[0],
        },
        {status: 404}
      );
    }

    console.log("attendanceSession: ", sessionForDay.id);
    // 4. If a session exists for the day, get all enrolled students
    const enrolledStudents = await prisma.studentClassEnrollment.findMany({
      where: {classSectionId: classSectionId},
      include: {
        student: {
          include: {
            user: {select: {name: true}},
            performanceMetrics: {
              where: {classSectionId: classSectionId},
            },
          },
        },
      },
      orderBy: {student: {studentRoll: 'asc'}}
    });

    // 5. Create a fast lookup map for the day's attendance
    const attendanceStatusMap = new Map<string, AttendanceStatus>();
    sessionForDay.attendanceRecords.forEach(record => {
      attendanceStatusMap.set(record.studentId, record.status);
    });

    // 6. Combine student list with their attendance status
    const studentDetailsList = enrolledStudents.map(({student}) => {
      const performance = student.performanceMetrics[0];
      const status: DailyAttendanceStatus = attendanceStatusMap.get(student.id) || 'NOT_MARKED';
      console.log("Attendance performance: ", performance);
      return {
        studentId: student.id,
        studentName: student.user.name,
        studentRoll: student.studentRoll,
        todaysStatus: status,
        overallAttendancePercentage: performance ? performance.attendancePercentage : null,
      };
    });

    // 7. Construct the final response
    // *** MODIFIED RESPONSE ***
    const responseData = {
      teacherId: sessionForDay.teacher.id,
      teacherName: sessionForDay.teacher.user.name,
      teacherEmail: sessionForDay.teacher.user.email,
      sessionStartDate: firstSession.sessionDate.toISOString().split('T')[0],
      scheduledDays: scheduledDays, // Include schedule info
      classSectionName: sessionForDay.classSection.sectionName,
      courseName: sessionForDay.course.name,
      date: dateParam,
      students: studentDetailsList,
    };

    return NextResponse.json(responseData, {status: 200});

  } catch (error) {
    console.error("Failed to fetch daily class attendance:", error);
    return NextResponse.json(
      {error: 'Internal Server Error'},
      {status: 500}
    );
  }
}


interface MarkAttendanceBody {
  studentId: string;
  classSectionId: string;
  date: string; // "YYYY-MM-DD"
  status: AttendanceStatus;
  teacherId: string; // The ID of the teacher marking the attendance
}

export async function PATCH(request: Request) {
  // 1. Parse and Validate the Request Body
  const body: MarkAttendanceBody = await request.json();
  const {studentId, classSectionId, date, status, teacherId} = body;

  if (!studentId || !classSectionId || !date || !status || !teacherId) {
    return NextResponse.json(
      {error: 'Missing required fields: studentId, classSectionId, date, status, teacherId'},
      {status: 400}
    );
  }

  // Validate that the status is a valid enum value
  if (!Object.values(AttendanceStatus).includes(status)) {
    return NextResponse.json({error: `Invalid status provided. Must be one of: ${Object.values(AttendanceStatus).join(', ')}`}, {status: 400});
  }

  const requestDate = new Date(date);
  if (isNaN(requestDate.getTime())) {
    return NextResponse.json({error: 'Invalid date format. Please use YYYY-MM-DD.'}, {status: 400});
  }

  try {
    // 2. Use a Transaction to ensure data integrity
    // Either both attendance and performance metrics are updated, or neither is.
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Find the specific attendance session for that day
      const dayStart = new Date(date);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayStart.getUTCDate() + 1);

      const sessionForDay = await tx.attendanceSession.findFirst({
        where: {
          classSectionId: classSectionId,
          sessionDate: {gte: dayStart, lt: dayEnd},
        },
        include: {
          classSection: {
            include: {
              semester: true,
            }
          }
        }
      });

      if (!sessionForDay) {
        // We must throw an error inside a transaction to trigger a rollback
        throw new Error('No attendance session was scheduled for this class on the specified date.');
      }

      if (sessionForDay.status !== 'COMPLETED') {
        await tx.attendanceSession.update({
          where: {id: sessionForDay.id},
          data: {status: 'COMPLETED'}
        })
      }

      // Step B: Find if an attendance record already exists for this student in this session
      const existingAttendance = await tx.attendance.findFirst({
        where: {
          attendanceSessionId: sessionForDay.id,
          studentId: studentId
        }
      });

      if (existingAttendance) {
        // If it exists, update it
        await tx.attendance.update({
          where: {id: existingAttendance.id},
          data: {status: status, recordedById: teacherId}
        });
      } else {
        // If it doesn't exist, create it
        await tx.attendance.create({
          data: {
            attendanceSessionId: sessionForDay.id,
            studentId: studentId,
            status: status,
            recordedById: teacherId,
            recordedAt: new Date(),
          }
        });
      }

      // Step C: Recalculate and update the student's performance metric
      const [totalSessions, attendedSessions] = await Promise.all([
        // Count all sessions for this class section up to today
        tx.attendanceSession.count({
          where: {
            classSectionId: classSectionId,
            sessionDate: {lte: new Date()},
            attendanceRecords: {
              some: {},
            },
          }
        }),
        // Count all sessions the student was marked PRESENT or LATE for
        tx.attendance.count({
          where: {
            studentId: studentId,
            status: {in: ['PRESENT', 'LATE']},
            attendanceSession: {
              classSectionId: classSectionId,
              status: 'COMPLETED',
            },
          }
        })
      ]);

      // Calculate percentage, avoiding division by zero
      const newAttendancePercentage = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

      // Update the performance metric record
      const existingMetric = await prisma.studentPerformanceMetric.findFirst({
        where: {
          studentId: studentId,
          classSectionId: sessionForDay.classSectionId,
          semesterId: sessionForDay.classSection.semesterId,
        }
      });

      if (existingMetric) {
        await tx.studentPerformanceMetric.update({
          where: {id: existingMetric.id},
          data: {
            attendancePercentage: parseFloat(newAttendancePercentage.toFixed(2)),
          }
        });
      } else {
        await tx.studentPerformanceMetric.create({
          data: {
            studentId: studentId,
            classSectionId: sessionForDay.classSectionId,
            semesterId: sessionForDay.classSection.semesterId,
            attendancePercentage: parseFloat(newAttendancePercentage.toFixed(2)),
            overallGradePoints: 0,
            assignmentCompletionRate: 0,
            detailedMetrics: {},
            performanceCategory: 'SATISFACTORY',
          }
        })
      }

      return {success: true};
    });

    // 3. Return a success response if the transaction completes
    if (result.success) {
      return NextResponse.json({message: 'Attendance updated successfully.'}, {status: 200});
    } else {
      // This case should ideally not be hit due to the transaction's nature
      throw new Error('Transaction failed for an unknown reason.');
    }

  } catch (error: any) {
    // If the error is the one we threw, it's a 404. Otherwise, it's a 500.
    if (error.message.includes('No attendance session')) {
      return NextResponse.json({error: error.message}, {status: 404});
    }
    console.error("Failed to update attendance:", error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}