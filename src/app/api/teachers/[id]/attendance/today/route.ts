import { NextRequest, NextResponse } from "next/server";
import { AttendanceTeacherService } from "@/services/attendanceTeacherService";

interface RouteParams {
  params: { teacherId: string };
}

export async function GET(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    try {
      console.log('hitting today sessions route where params: ');
    
      const pathParts = req.nextUrl.pathname.split('/');
      console.log('pathparts: ',pathParts);
  const teacherId = pathParts[pathParts.length - 3]; 
    const service = new AttendanceTeacherService();
    const sessions = await service.getTodayAttendanceSessions(teacherId);
    return NextResponse.json(sessions);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch today's sessions";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}