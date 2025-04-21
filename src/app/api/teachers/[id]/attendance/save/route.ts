import { NextRequest, NextResponse } from "next/server";
import { AttendanceTeacherService } from "@/services/attendanceTeacherService"


interface SaveAttendanceRequestBody {
  sessionId: string;
  teacherId: string;
  attendanceData: { studentId: string; status: "PRESENT" | "ABSENT" }[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: SaveAttendanceRequestBody = await req.json();
    const { sessionId, teacherId, attendanceData } = body;

    const service = new AttendanceTeacherService();
    const result = await service.saveAttendanceRecords({
      sessionId,
      teacherId,
      attendanceData,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save attendance";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

