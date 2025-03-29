import { NextRequest, NextResponse } from 'next/server';
import { ExamSubmissionService } from '@/services/examSubmissionService';

const examSubmissionService = new ExamSubmissionService();

export class ExamSubmissionController {
  async getAllExamSubmissions() {
    try {
      const submissions = await examSubmissionService.getAllExamSubmissions();
      return NextResponse.json(submissions);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async createExamSubmission(req: NextRequest) {
    try {
      const data = await req.json();
      const submission = await examSubmissionService.createExamSubmission(data);
      return NextResponse.json(submission, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getExamSubmissionById(id: string) {
    try {
      const submission = await examSubmissionService.getExamSubmissionById(id);
      if (!submission) {
        return NextResponse.json({ error: 'Exam submission not found' }, { status: 404 });
      }
      return NextResponse.json(submission);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async updateExamSubmission(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const updatedSubmission = await examSubmissionService.updateExamSubmission(id, data);
      return NextResponse.json(updatedSubmission);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async deleteExamSubmission(id: string) {
    try {
      await examSubmissionService.deleteExamSubmission(id);
      return NextResponse.json({ message: 'Exam submission deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
