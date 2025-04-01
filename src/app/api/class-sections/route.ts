import { NextRequest} from 'next/server';
import { ClassSectionController } from '@/controllers/classSectionController';

const classSectionController = new ClassSectionController();

export async function GET(req: NextRequest) {
  return classSectionController.getAllClassSections(req);
}

export async function POST(req: NextRequest) {
  return classSectionController.createClassSection(req);
}