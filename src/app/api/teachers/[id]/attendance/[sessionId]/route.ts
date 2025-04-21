import { NextRequest, NextResponse } from "next/server";
import { AttendanceTeacherService } from "@/services/attendanceTeacherService"

interface CreateAttendanceRequestBody {
  sessionId: string;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const url = req.url;
        const urlParts=url.split('/');
    const  sessionId=urlParts[urlParts.length-1]; 

    const service = new AttendanceTeacherService();
    const session = await service.getAttendanceBySessionId(sessionId);

    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get attendance by session id";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}