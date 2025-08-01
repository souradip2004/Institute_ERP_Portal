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

    // The main query remains the same, as `enrollmentStatus` is a direct field
    // on the `StudentClassEnrollment` model we are fetching.
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
        // Also fetch metadata about the class section itself
        classSection: {
          include: {
            attendanceSessions: {
              orderBy: { sessionDate: 'asc' }, // Order to get the first session
              take: 1, // Efficiently get just one
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

    // Extract the course name once from the first result.
    const courseName = enrolledStudents[0]?.classSection.attendanceSessions[0]?.course.name || null;

    // Map the results into the final response structure
    const studentList = enrolledStudents.map((enrollment) => {
      const { student } = enrollment;
      const performance = student.performanceMetrics[0];

      return {
        id: student.id,
        name: student.user.name,
        rollNo: student.studentRoll,
        user: {
          name: student.user.name,
          email: student.user.email
        },
        status: enrollment.enrollmentStatus,
        attendancePercentage: performance ? performance.attendancePercentage : null,
        message: student.attendanceRecords.length > 0
          ? 'Attendance data available.'
          : 'Attendance has not been marked for this student yet.',
      };
    });

    // Structure the final response for better frontend handling
    const responseData = {
      students: studentList
    };

    // Return the formatted student data with a 200 OK status
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch student attendance:", error);
    // Return a generic error response for any other issues
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}