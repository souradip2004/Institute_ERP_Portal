import {NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request) {
  // Extract classSectionId from the URL parameters
  const {searchParams} = new URL(request.url);
  const classSectionId = searchParams.get('classSectionId');

  if (!classSectionId) {
    return NextResponse.json(
      {error: 'classSectionId is required'},
      {status: 400}
    );
  }

  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set time to the end of the day

    const enrolledStudents = await prisma.studentClassEnrollment.findMany({
      where: {
        classSectionId: classSectionId,
      },
      include: {
        student: {
          include: {
            user: true,
            // Conditionally fetch attendance records up to today
            attendanceRecords: {
              where: {
                attendanceSession: {
                  classSectionId: classSectionId,
                  sessionDate: {
                    lte: today, // lte: less than or equal to
                  },
                },
              },
              select: {
                attendanceSession: {
                  select: {
                    course: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
            // Fetch performance metrics for this specific class section
            performanceMetrics: {
              where: {
                classSectionId: classSectionId,
              },
            },
          },
        },
      },
    });

    console.log("Enrolled students: ", enrolledStudents);

    const studentAttendanceDetails = enrolledStudents.map((enrollment) => {
      const {student} = enrollment;
      const courseName = student.attendanceRecords[0]?.attendanceSession?.course?.name || null;

      // Check if any attendance has been recorded for the student in this section
      if (student.attendanceRecords.length > 0) {
        // If attendance exists, performance metrics should also exist.
        const performance = student.performanceMetrics[0]; // Assumes one metric per student per class section

        return {
          studentId: student.id,
          studentName: student.user.name, // Assumes 'name' field on User model
          studentRoll: student.studentRoll,
          courseName,
          attendancePercentage: performance
            ? performance.attendancePercentage
            : null, // Return null if metrics are not calculated yet
          message: performance ? 'Data available' : 'Performance data not yet calculated.'
        };
      } else {
        // No attendance records exist for this student.
        return {
          studentId: student.id,
          studentName: student.user.name,
          studentRoll: student.studentRoll,
          courseName,
          attendancePercentage: null, // No attendance, so percentage is null
          message: 'Attendance has not been marked for this student yet.',
        };
      }
    });

    // Return the formatted student data with a 200 OK status
    return NextResponse.json(studentAttendanceDetails, {status: 200});

  } catch (error) {
    console.error("Failed to fetch student attendance:", error);
    // Return a generic error response
    return NextResponse.json(
      {error: 'Internal Server Error'},
      {status: 500}
    );
  }
}