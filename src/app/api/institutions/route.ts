import { NextRequest } from 'next/server';
import { InstitutionController } from '@/controllers/institutionController';

const institutionController = new InstitutionController();

export const GET = async (req: NextRequest) => {
  return institutionController.getAllInstitutions(req);
};

export const POST = async (req: NextRequest) => {
  return institutionController.createInstitution(req);
};
