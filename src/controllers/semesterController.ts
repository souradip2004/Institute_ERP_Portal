import { NextRequest, NextResponse } from 'next/server';
import { SemesterService } from '@/services/semesterService';

const semesterService = new SemesterService();

export class SemesterController {
  async getAllSemesters() {
    try {
      const semesters = await semesterService.getAllSemesters();
      return NextResponse.json(semesters);
    } catch (error: any) {
      console.error('Error fetching semesters:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async createSemester(req: NextRequest) {
    try {
      const data = await req.json();
      const semester = await semesterService.createSemester(data);
      return NextResponse.json(semester, { status: 201 });
    } catch (error: any) {
      console.error('Error creating semester:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async getSemesterById(semesterId: string) {
    try {
      if (!semesterId) {
        return NextResponse.json({ error: 'Semester ID is required' }, { status: 400 });
      }

      const semester = await semesterService.getSemesterById(semesterId);
      if (!semester) {
        return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
      }

      return NextResponse.json(semester);
    } catch (error: any) {
      console.error('Error fetching semester by ID:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async updateSemester(semesterId: string, req: NextRequest) {
    try {
      if (!semesterId) {
        return NextResponse.json({ error: 'Semester ID is required' }, { status: 400 });
      }

      const data = await req.json();
      const updatedSemester = await semesterService.updateSemester(semesterId, data);
      return NextResponse.json(updatedSemester);
    } catch (error: any) {
      console.error('Error updating semester:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async deleteSemester(semesterId: string) {
    try {
      if (!semesterId) {
        return NextResponse.json({ error: 'Semester ID is required' }, { status: 400 });
      }

      await semesterService.deleteSemester(semesterId);
      return NextResponse.json({ message: 'Semester deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting semester:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}
