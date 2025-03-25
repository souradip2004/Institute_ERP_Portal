import { NextApiRequest, NextApiResponse
} from "next";
import prisma from "@/lib/prisma";
import e from "cors";

/*
  id             String      @id @default(uuid()) @db.Uuid
  classSectionId String      @map("class_section_id") @db.Uuid
  teacherId      String      @map("teacher_id") @db.Uuid
  sessionDate    DateTime    @map("session_date") @db.Date
  startTime      DateTime    @map("start_time") @db.Time
  endTime        DateTime    @map("end_time") @db.Time
  sessionType    SessionType @map("session_type")
  status         Status      @default(scheduled)
  createdAt      DateTime    @default(now()) @map("created_at")
  updatedAt      DateTime    @updatedAt @map("updated_at")
*/
/*
  id                  String           @id @default(uuid()) @db.Uuid
  attendanceSessionId String           @map("attendance_session_id") @db.Uuid
  studentId           String           @map("student_id") @db.Uuid
  status              AttendanceStatus
  remarks             String?
  recordedById        String           @map("recorded_by") @db.Uuid
  recordedAt          DateTime         @map("recorded_at")
  updatedAt           DateTime         @updatedAt @map("updated_at")
  isLocked            Boolean          @default(false) @map("is_locked")
  */
type Data = {
    classSectionId: string;
    teacherId: string;
    sessionDate: Date;
    startTime: Date;
    endTime: Date;
    sessionType: "lecture" | "lab" | "tutorial";
    status: "scheduled" | "inProgress" | "completed";
    createdAt: Date;
    updatedAt: Date;
};
type receivingData = {
    classSectionID: string;
    teacherID: string;
    sessionType:"lecture" | "lab" | "tutorial";
};
type Student={
    userId: string;
    studentId: string;
    firstName: string;
    lastName: string;
    present:boolean;
}
type attendance={
    attendanceSessionId:string;
    studentId:string;
    status:"present"|"absent"|"late"|"excused";
    remarks:string;
    recordedById:string;
    recordedAt:Date;
    updatedAt:Date;
    isLocked:boolean;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let e:receivingData = req.body.teacherID;
    let student:Student[]=req.body.students;
    let d:Data = {
        classSectionId: e.classSectionID,
        teacherId: e.teacherID,
        sessionDate: new Date(),
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)),
        sessionType: e.sessionType,
        status: "scheduled",
        createdAt: new Date(),
        updatedAt: new Date()
    }
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    try {
        let session = await prisma.attendanceSession.create({
            data: d
        })
        student.forEach(async (student: Student) => {
            let attendanceRecord: attendance = {
                attendanceSessionId: session.id,
                studentId: student.userId,
                status: student.present ? "present" : "absent",
                remarks: "",
                recordedById: "",
                recordedAt: new Date(),
                updatedAt: new Date(),
                isLocked: false
            }
            await prisma.attendance.create({
                data: attendanceRecord
            });
        })
        return res.status(201).json({ message: 'Session created successfully', userId: session.id });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}