import { NextRequest,NextResponse } from 'next/server';
import { InstitutionController } from '@/controllers/institutionController';

const institutionController = new InstitutionController();

export const GET = async (req: NextRequest, context : { params: { id: string } }) => {
  const { params } = context;
  return institutionController.getInstitutionById(params.id);
};

export const PATCH = async (req: NextRequest, context: { params: { id: string } }) => {
  const { params } = await context;
  return institutionController.updateInstitution(params.id, req);
};


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

