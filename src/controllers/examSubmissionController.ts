import { NextRequest, NextResponse } from 'next/server';
import { ExamSubmissionService } from '@/services/examSubmissionService';

const examSubmissionService = new ExamSubmissionService();

export class ExamSubmissionController {
  async getAll() {
    try {
      const submissions = await examSubmissionService.getAll();
      return NextResponse.json(submissions);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async create(req: NextRequest) {
    try {
      const data = await req.json();
      const submission = await examSubmissionService.create(data);
      return NextResponse.json(submission, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getById(id: string) {
    try {
      const submission = await examSubmissionService.getById(id);
      if (!submission) {
        return NextResponse.json({ error: 'Exam submission not found' }, { status: 404 });
      }
      return NextResponse.json(submission);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async update(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const updatedSubmission = await examSubmissionService.update(id, data);
      return NextResponse.json(updatedSubmission);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async delete(id: string) {
    try {
      await examSubmissionService.delete(id);
      return NextResponse.json({ message: 'Exam submission deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}