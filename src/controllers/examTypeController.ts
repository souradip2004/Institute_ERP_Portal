import { NextRequest, NextResponse } from 'next/server';
import { ExamTypeService } from '@/services/examTypeService';

const examTypeService = new ExamTypeService();

export class ExamTypeController {
  async getAllExamTypes() {
    try {
      const examTypes = await examTypeService.getAllExamTypes();
      return NextResponse.json(examTypes);
    } catch (error: any) {
      console.error('Error fetching exam types:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async createExamType(req: NextRequest) {
    try {
      const data = await req.json();
      const examType = await examTypeService.createExamType(data);
      return NextResponse.json(examType, { status: 201 });
    } catch (error: any) {
      console.error('Error creating exam type:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async getExamTypeById(examTypeId: string) {
    try {
      if (!examTypeId) {
        return NextResponse.json({ error: 'Exam Type ID is required' }, { status: 400 });
      }

      const examType = await examTypeService.getExamTypeById(examTypeId);
      if (!examType) {
        return NextResponse.json({ error: 'Exam Type not found' }, { status: 404 });
      }

      return NextResponse.json(examType);
    } catch (error: any) {
      console.error('Error fetching exam type by ID:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async updateExamType(examTypeId: string, req: NextRequest) {
    try {
      if (!examTypeId) {
        return NextResponse.json({ error: 'Exam Type ID is required' }, { status: 400 });
      }

      const data = await req.json();
      const examType = await examTypeService.updateExamType(examTypeId, data);
      return NextResponse.json(examType);
    } catch (error: any) {
      console.error('Error updating exam type:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async deleteExamType(examTypeId: string) {
    try {
      if (!examTypeId) {
        return NextResponse.json({ error: 'Exam Type ID is required' }, { status: 400 });
      }

      await examTypeService.deleteExamType(examTypeId);
      return NextResponse.json({ message: 'Exam Type deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting exam type:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}
