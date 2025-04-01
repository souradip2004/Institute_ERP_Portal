import { NextRequest} from 'next/server';
import { ClassSectionController } from '@/controllers/classSectionController';

const classSectionController = new ClassSectionController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return classSectionController.getClassSectionById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return classSectionController.updateClassSection(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return classSectionController.deleteClassSection(params.id);
}