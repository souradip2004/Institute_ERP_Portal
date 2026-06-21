import { NextRequest,NextResponse } from 'next/server';
import { InstitutionController } from '@/controllers/institutionController';

const institutionController = new InstitutionController();

export const GET = async (req: NextRequest, context : { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  return institutionController.getInstitutionById(params.id);
};

export const PATCH = async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  return institutionController.updateInstitution(params.id, req);
};


export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const institutionId = params?.id;

    if (!institutionId) {
      return NextResponse.json({ error: "Institution ID is required" }, { status: 400 });
    }

    console.log("Deleting institution with ID:", institutionId);

    await institutionController.deleteInstitution(institutionId);

    return NextResponse.json({ message: "Institution deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting institution:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

