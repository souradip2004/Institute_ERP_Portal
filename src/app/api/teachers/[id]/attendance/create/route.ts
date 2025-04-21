import { NextRequest, NextResponse } from "next/server";
import { AttendanceTeacherService } from "@/services/attendanceTeacherService"

interface CreateAttendanceRequestBody {
  teacherId: string;
  courseId: string;
  classSectionId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateAttendanceRequestBody = await req.json();
    const { teacherId, courseId, classSectionId, sessionDate, startTime, endTime } = body;

    const service = new AttendanceTeacherService();
    const session = await service.createAttendanceSession({
      teacherId,
      courseId,
      classSectionId,
      sessionDate,
      startTime,
      endTime,
    });

    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create attendance session";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}