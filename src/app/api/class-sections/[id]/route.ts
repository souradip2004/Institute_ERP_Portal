import { NextRequest, NextResponse } from 'next/server';
import { ClassSectionController } from '@/controllers/classSectionController';

const classSectionController = new ClassSectionController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Invalid Class Section ID' }, { status: 400 });
    }

    return await classSectionController.getClassSectionById(params.id);
  } catch (error: any) {
    console.error(`Error in GET /api/class-sections/${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Invalid Class Section ID' }, { status: 400 });
    }

    return await classSectionController.updateClassSection(params.id, req);
  } catch (error: any) {
    console.error(`Error in PATCH /api/class-sections/${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Invalid Class Section ID' }, { status: 400 });
    }

    return await classSectionController.deleteClassSection(params.id);
  } catch (error: any) {
    console.error(`Error in DELETE /api/class-sections/${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
