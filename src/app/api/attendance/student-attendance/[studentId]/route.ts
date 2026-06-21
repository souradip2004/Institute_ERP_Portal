import {NextResponse} from 'next/server';
import {PrismaClient, AttendanceStatus} from '@prisma/client';

const prisma = new PrismaClient();

type DetailedAttendanceStatus = AttendanceStatus | 'NOT_MARKED';

export async function GET(request: Request, props: { params: Promise<{ studentId: string }> }) {
  const params = await props.params;
  // 1. Extract IDs and optional filters from the request
  const {studentId} = params;
  const {searchParams} = new URL(request.url);
  const motherClassId = searchParams.get('motherClassId');
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  // 2. Validate the primary inputs
  if (!studentId || !motherClassId) {
    return NextResponse.json(
      {error: 'studentId (in URL) and motherClassId (as query param) are required'},
      {status: 400}
    );
  }

  if ((month && !year) || (!month && year)) {
    return NextResponse.json(
      {error: 'Both month and year must be provided together for filtering.'},
      {status: 400}
    );
  }

  try {
    // 3. Fetch student and mother class details
    const [student, motherClass] = await Promise.all([
      prisma.student.findUnique({
        where: {id: studentId},
        include: {
          user: {select: {name: true, email: true}},
        },
      }),
      prisma.motherClass.findUnique({
        where: {id: motherClassId},
        select: {
          sectionName: true,
          classSections: {
            select: {
              id: true,
              sectionName: true
            },
          },
        },
      }),
    ]);

    if (!student) {
      return NextResponse.json({error: 'Student not found'}, {status: 404});
    }
    if (!motherClass) {
      return NextResponse.json({error: 'Mother Class not found'}, {status: 404});
    }

    const classSectionIds = motherClass.classSections.map(cs => cs.id);

    if (classSectionIds.length === 0) {
      const responseData = {
        studentId: student.id,
        studentName: student.user.name,
        studentEmail: student.user.email,
        studentRoll: student.studentRoll,
        motherClassName: motherClass.sectionName,
        attendanceHistory: [],
      };
      return NextResponse.json(responseData);
    }

    // 4. Create the date filter
    let dateFilter = {};
    if (month && year) {
      const monthInt = parseInt(month, 10);
      const yearInt = parseInt(year, 10);
      if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
        return NextResponse.json({error: 'Invalid month or year provided.'}, {status: 400});
      }
      const startDate = new Date(yearInt, monthInt - 1, 1);
      const endDate = new Date(yearInt, monthInt, 1);
      dateFilter = {gte: startDate, lt: endDate};
    } else {
      dateFilter = {lte: new Date()};
    }

    // 5. Fetch all sessions (this part remains the same)
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        classSectionId: {in: classSectionIds},
        sessionDate: dateFilter,
      },
      include: {
        course: {select: {name: true}},
        classSection: {select: {sectionName: true}},
        attendanceRecords: {
          where: {studentId: studentId},
        },
      },
      orderBy: {
        sessionDate: 'asc',
      },
    });

    // 6. --- KEY CHANGE: Group the flat session list by date ---
    const groupedByDate = new Map<string, any[]>();

    sessions.forEach((session) => {
      const dateString = session.sessionDate.toISOString().split('T')[0];
      const status: DetailedAttendanceStatus =
        session.attendanceRecords.length > 0
          ? session.attendanceRecords[0].status
          : 'NOT_MARKED';

      const sessionDetails = {
        sessionType: session.sessionType,
        courseName: session.course.name,
        classSectionName: session.classSection.sectionName,
        status: status,
      };

      // If the date isn't a key yet, initialize it with an empty array
      if (!groupedByDate.has(dateString)) {
        groupedByDate.set(dateString, []);
      }

      // Push the current session's details into the array for that date
      groupedByDate.get(dateString)?.push(sessionDetails);
    });

    // Convert the Map into the desired final array structure
    const attendanceHistory = Array.from(groupedByDate.entries()).map(([date, sessions]) => ({
      date: date,
      sessions: sessions
    }));

    // 7. Construct the final response object with the new structure
    const responseData = {
      studentId: student.id,
      studentName: student.user.name,
      studentEmail: student.user.email,
      studentRoll: student.studentRoll,
      motherClassName: motherClass.sectionName,
      attendanceHistory: attendanceHistory, // Use the new grouped history
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