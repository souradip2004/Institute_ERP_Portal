import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classSectionId = params.id;

    if (!classSectionId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching students for class ID: ${classSectionId}`);

    // Fetch students enrolled in this class section from the database
    const enrollments = await prisma.studentClassEnrollment.findMany({
      where: {
        classSectionId,
        enrollmentStatus: "ENROLLED", // Only get currently enrolled students
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            attendanceRecords: {
              where: {
                attendanceSession: {
                  classSectionId,
                },
              },
            },
          },
        },
      },
    });

    // Format the data to match the expected structure
    const students = enrollments.map((enrollment) => {
      // Calculate attendance percentage
      const totalAttendanceRecords =
        enrollment.student.attendanceRecords.length;
      const presentRecords = enrollment.student.attendanceRecords.filter(
        (record) => record.status === "PRESENT"
      ).length;

      const attendancePercentage =
        totalAttendanceRecords > 0
          ? Math.round((presentRecords / totalAttendanceRecords) * 100)
          : 0;

      // Check if student was present in the most recent attendance record
      const latestAttendance = enrollment.student.attendanceRecords.sort(
        (a, b) =>
          new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      )[0];

      const status = latestAttendance ? latestAttendance.status : "UNKNOWN";

      return {
        id: enrollment.student.id,
        name: enrollment.student.user.name || "Unknown",
        rollNo: enrollment.student.studentRoll,
        user: {
          name: enrollment.student.user.name || "Unknown",
          email: enrollment.student.user.email || "unknown@example.com",
        },
        attendancePercentage: attendancePercentage || 0,
        status: status || "UNKNOWN",
      };
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error in class students API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch students data" },
      { status: 500 }
    );
  }
}
