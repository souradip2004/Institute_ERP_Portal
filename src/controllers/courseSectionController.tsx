import { NextRequest, NextResponse } from 'next/server';
import { CourseSectionController } from '@/services/couseSectionService';

const examSubmissionService = new CourseSectionController();

export class CourseSectionControll {
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
}