import {NextResponse} from 'next/server';
import {PrismaClient, AttendanceStatus} from '@prisma/client';

const prisma = new PrismaClient();

type DetailedAttendanceStatus = AttendanceStatus | 'NOT_MARKED';

export async function GET(
  request: Request,
  {params}: { params: { studentId: string } }
) {
  // 1. Extract IDs and optional filter parameters from the request
  const {studentId} = params;
  const {searchParams} = new URL(request.url);
  const classSectionId = searchParams.get('classSectionId');
  const month = searchParams.get('month'); // e.g., '7' for July
  const year = searchParams.get('year');   // e.g., '2025'

  // 2. Validate the input
  if (!studentId || !classSectionId) {
    return NextResponse.json(
      {error: 'studentId (in URL) and classSectionId (as query param) are required'},
      {status: 400}
    );
  }

  // Enforce that if one filter is provided, the other must be too.
  if ((month && !year) || (!month && year)) {
    return NextResponse.json(
      {error: 'Both month and year must be provided together for filtering.'},
      {status: 400}
    );
  }

  /*
   * FUTURE-PROOFING NOTE:
   * To make month and year compulsory, you would remove the 'if (month && year)'
   * block below and its 'else' part. The validation above would be changed to:
   * if (!month || !year) { return NextResponse.json(...) }
   */

  try {
    // 3. Fetch student details (this remains the same)
    const student = await prisma.student.findUnique({
      where: {id: studentId},
      include: {
        user: {select: {name: true}},
      },
    });

    if (!student) {
      return NextResponse.json({error: 'Student not found'}, {status: 404});
    }

    // 4. Dynamically create the date filter for the Prisma query
    let dateFilter = {};

    if (month && year) {
      // Logic for when a specific month is requested
      const monthInt = parseInt(month, 10);
      const yearInt = parseInt(year, 10);

      if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
        return NextResponse.json({error: 'Invalid month or year provided.'}, {status: 400});
      }

      // Start date is the first moment of the given month
      const startDate = new Date(yearInt, monthInt - 1, 1);
      // End date is the first moment of the next month
      const endDate = new Date(yearInt, monthInt, 1);

      dateFilter = {
        gte: startDate, // Greater than or equal to the start of the month
        lt: endDate,    // Less than the start of the next month
      };

    } else {
      // Fallback logic: Fetch all records up to today
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      dateFilter = {
        lte: today,
      };
    }

    // 5. Fetch attendance sessions using the dynamic date filter
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        classSectionId: classSectionId,
        sessionDate: dateFilter, // Apply the determined date filter here
      },
      include: {
        course: {select: {name: true}},
        attendanceRecords: {
          where: {studentId: studentId},
        },
      },
      orderBy: {
        sessionDate: 'asc',
      },
    });

    // 6. Map results and construct the final response (this remains the same)
    const attendanceHistory = sessions.map((session) => {
      const status: DetailedAttendanceStatus =
        session.attendanceRecords.length > 0
          ? session.attendanceRecords[0].status
          : 'NOT_MARKED';

      return {
        sessionDate: session.sessionDate.toISOString().split('T')[0],
        sessionType: session.sessionType,
        courseName: session.course.name,
        status: status,
      };
    });

    const responseData = {
      studentId: student.id,
      studentName: student.user.name,
      studentRoll: student.studentRoll,
      attendanceHistory: attendanceHistory,
    };

    return NextResponse.json(responseData, {status: 200});

  } catch (error) {
    console.error("Failed to fetch detailed student attendance:", error);
    return NextResponse.json(
      {error: 'Internal Server Error'},
      {status: 500}
    );
  }
}