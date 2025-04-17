import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/services/teacherService';

const teacherService = new TeacherService();

export async function GET(req: NextRequest) {
  const pathParts = req.nextUrl.pathname.split('/');
  const teacherId = pathParts[pathParts.length - 3];

  if (!teacherId) {
    return NextResponse.json({ error: 'teacherId is required' }, { status: 400 });
  }

  try {
    const sections = await teacherService.getTeacherAttendanceBySection(teacherId);

    if (!sections) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const formattedData = sections.map((section: any) => {
      const sectionId = section.classSection.id;
      const sectionName = section.classSection.name;
      const studentList = section.classSection.studentEnrollments || [];
      const attendanceByDate = section.attendanceSessions || [];

      const noOfStudent = studentList.length;

      // Create map: studentId => { meta, statuses per date }
      const studentAttendanceMap: Record<string, any> = {};

      studentList.forEach((student: any) => {
        studentAttendanceMap[student.id] = {
          meta: {
            id: student.id,
            name: student.name,
            email: student.email,
          },
          records: [], // Each date will push status here
        };
      });

      const attendanceByDateResult = attendanceByDate.map((session: any) => {
        const presentStudentIds = session.attendanceRecords.map((rec: any) => rec.student.id);
        const allStudentStatuses: any[] = [];

        studentList.forEach((student: any) => {
          const status = presentStudentIds.includes(student.id) ? 'PRESENT' : 'ABSENT';

          // Push status to that student for this date
          if (studentAttendanceMap[student.id]) {
            studentAttendanceMap[student.id].records.push({
              dateId: session.id,
              date: session.date,
              status,
            });
          }

          allStudentStatuses.push({
            userId: student.id,
            status,
          });
        });

        const presentCount = allStudentStatuses.filter(s => s.status === 'PRESENT').length;
        const percent = noOfStudent > 0 ? ((presentCount / noOfStudent) * 100).toFixed(2) : '0.00';

        return {
          meta: {
            id: session.id,
            date: session.date,
          },
          students: allStudentStatuses,
          presentage: percent,
        };
      });

      const attendanceByStudent = Object.values(studentAttendanceMap).map((student: any) => {
        const totalPresent = student.records.filter((r: any) => r.status === 'PRESENT').length;
        const percent = attendanceByDate.length > 0
          ? ((totalPresent / attendanceByDate.length) * 100).toFixed(2)
          : '0.00';

        return {
          meta: student.meta,
          records: student.records,
          presentage: percent,
        };
      });

            const totalSessions = attendanceByDate.length;
      const totalAttendancePossible = noOfStudent * totalSessions;

      // Total present count from all student records
      const totalPresentCount = Object.values(studentAttendanceMap).reduce((acc: number, student: any) => {
        const presentCount = student.records.filter((r: any) => r.status === 'PRESENT').length;
        return acc + presentCount;
      }, 0);

      const sectionPresentage = totalAttendancePossible > 0
        ? ((totalPresentCount / totalAttendancePossible) * 100).toFixed(2)
        : '0.00';

      return {
        sectionId,
        sectionName,
        noOfStudent,
        attendanceByStudent,
        attendanceByDate: attendanceByDateResult,
        presentage: sectionPresentage,
      }
    });



    return NextResponse.json({ sectionWiseData: formattedData, status: 'success',  teacherAttendance:'100%' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
