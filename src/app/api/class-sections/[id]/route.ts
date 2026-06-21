import { NextRequest} from 'next/server';
import { ClassSectionController } from '@/controllers/classSectionController';

const classSectionController = new ClassSectionController();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return classSectionController.getClassSectionById(params.id);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return classSectionController.updateClassSection(params.id, req);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return classSectionController.deleteClassSection(params.id);
}