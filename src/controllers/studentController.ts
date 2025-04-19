import { NextRequest, NextResponse } from 'next/server';
import { StudentService } from '@/services/studentService';

const studentService = new StudentService();

export class StudentController {
  async getAllStudents(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const batchId = searchParams.get("batchId");
        const departmentId = searchParams.get("departmentId");

        let students;

        if (batchId) {
            students = await studentService.getStudentsByBatchId(batchId);  // ✅ Call correct method
        } else if (departmentId) {
            students = await studentService.getStudentsByDeptId(departmentId); // ✅ Call correct method
        } else {
            students = await studentService.getAllStudents(); // ✅ Only called when no filters are applied
        }

        return NextResponse.json(students);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


  async createStudent(req: NextRequest) {
    try {
      const data = await req.json();
      const student = await studentService.createStudent(data);
      return NextResponse.json(student, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getStudentById(id: string, req?: NextRequest) {
    try {
      // Check if we should include class enrollment data
      let includeClassSection = false;
      if (req) {
        const { searchParams } = new URL(req.url);
        includeClassSection = searchParams.get("includeClassSection") === "true";
      }

      const student = await studentService.getStudentById(id, includeClassSection);
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }
      return NextResponse.json(student);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async updateStudent(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const student = await studentService.updateStudent(id, data);
      return NextResponse.json(student);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async deleteStudent(id: string) {
    try {
      await studentService.deleteStudent(id);
      return NextResponse.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
