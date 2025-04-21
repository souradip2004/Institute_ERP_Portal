import { NextRequest, NextResponse } from "next/server";
import { AttendanceTeacherService } from "@/services/attendanceTeacherService"; // Adjust import

interface RouteParams {
  params: { sessionId: string };
}

export async function GET(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const url = req.url;
    console.log('url : ', url);
    const pathParts = url.split('/')
    console.log('pathparts: ,',pathParts);
    const sessionId = pathParts[pathParts.length - 1];
    const teacherId=pathParts[pathParts.length-4];
    // const { sessionId } = params;
    const service = new AttendanceTeacherService();
    const sessionDetails = await service.getAttendanceSessionDetails(sessionId,teacherId);
    return NextResponse.json(sessionDetails);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch session details";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}