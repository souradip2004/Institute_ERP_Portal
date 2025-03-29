import { NextRequest, NextResponse } from 'next/server';
import { ClassSectionController } from '@/controllers/classSectionController';

const classSectionController = new ClassSectionController();

export async function GET(req: NextRequest) {
  return await classSectionController.getAllClassSections(req);
}

export async function POST(req: NextRequest) {
  return await classSectionController.createClassSection(req);
}
