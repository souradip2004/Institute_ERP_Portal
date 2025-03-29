import { NextRequest } from 'next/server';
import { InstitutionController } from '@/controllers/institutionController';

const institutionController = new InstitutionController();

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  return institutionController.getInstitutionById(params.id);
};

export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => {
  return institutionController.updateInstitution(params.id, req);
};

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  return institutionController.deleteInstitution(params.id);
};
