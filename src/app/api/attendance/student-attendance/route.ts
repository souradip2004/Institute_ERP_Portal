import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classSectionId = searchParams.get('classSectionId');

  if (!classSectionId) {
    return NextResponse.json(
      { error: 'classSectionId is required' },
      { status: 400 }
    );
  }

  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const enrolledStudents = await prisma.studentClassEnrollment.findMany({
      where: {
        classSectionId: classSectionId,
      },
      include: {

        student: {
          include: {
            user: true,
            attendanceRecords: {
              where: {
                attendanceSession: {
                  classSectionId: classSectionId,
                  sessionDate: { lte: today },
                },
              },
            },
            performanceMetrics: {
              where: {
                classSectionId: classSectionId,
              },
            },
          },
        },
        classSection: {
          include: {
            attendanceSessions: {
              take: 1,
              select: {
                course: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Handle case where no students are enrolled in this section
    if (enrolledStudents.length === 0) {
      return NextResponse.json(
        { message: 'No students are enrolled in this class section.' },
        { status: 404 }
      );
    }

    // 3. Extract the course name once from the first result. It's the same for all.
    // The optional chaining (?.) makes this safe if no sessions exist yet.
    const courseName = enrolledStudents[0]?.classSection.attendanceSessions[0]?.course.name || null;

    // 4. Map the results into the final response structure
    const studentAttendanceDetails = enrolledStudents.map((enrollment) => {
      const { student } = enrollment;
      const performance = student.performanceMetrics[0];

      // This logic is now cleaner and more consistent for all students
      return {
        studentId: student.id,
        studentName: student.user.name,
        studentRoll: student.studentRoll,
        courseName: courseName, // Use the reliably fetched course name
        attendancePercentage: performance ? performance.attendancePercentage : null,
        message: student.attendanceRecords.length > 0
          ? 'Attendance data available.'
          : 'Attendance has not been marked for this student yet.',
      };
    });

    // 5. Return the formatted student data with a 200 OK status
    return NextResponse.json(studentAttendanceDetails, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch student attendance:", error);
    // Return a generic error response for any other issues
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}