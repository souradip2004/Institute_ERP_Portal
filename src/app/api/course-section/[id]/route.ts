import { NextRequest, NextResponse } from 'next/server';
import { CourseSectionControll } from '@/controllers/courseSectionController';

const examSubmissionController = new CourseSectionControll();

// Search exam submision by student id
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return examSubmissionController.getById(id);
}
