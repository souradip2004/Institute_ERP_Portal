import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/services/teacherService';

const teacherService = new TeacherService();

export class TeacherController {
  async getAllTeachers(req: NextRequest) {
    try {
      const teachers = await teacherService.getAllTeachers();
      return NextResponse.json(teachers);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async createTeacher(req: NextRequest) {
    try {
      const data = await req.json();
      const teacher = await teacherService.createTeacher(data);
      return NextResponse.json(teacher, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getTeacherById(id: string) {
    try {
      const teacher = await teacherService.getTeacherById(id);
      if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
      }
      return NextResponse.json(teacher);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async updateTeacher(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const teacher = await teacherService.updateTeacher(id, data);
      return NextResponse.json(teacher);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async deleteTeacher(id: string) {
    try {
      await teacherService.deleteTeacher(id);
      return NextResponse.json({ message: 'Teacher deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
