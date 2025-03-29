import { NextRequest, NextResponse } from 'next/server';
import { ExamService } from '@/services/examService';

const examService = new ExamService();

export class ExamController {
  async getAllExams(req: NextRequest) {
    try {
      const exams = await examService.getAllExams();
      return NextResponse.json(exams);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async createExam(req: NextRequest) {
    try {
      const data = await req.json();
      const exam = await examService.createExam(data);
      return NextResponse.json(exam, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getExamById(id: string) {
    try {
      const exam = await examService.getExamById(id);
      if (!exam) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
      }
      return NextResponse.json(exam);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async updateExam(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const exam = await examService.updateExam(id, data);
      return NextResponse.json(exam);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async deleteExam(id: string) {
    try {
      await examService.deleteExam(id);
      return NextResponse.json({ message: 'Exam deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
