import { NextRequest } from 'next/server';
import { InstitutionController } from '@/controllers/institutionController';

const institutionController = new InstitutionController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    console.log('hi from institution dept');
    const { id } = await params;
    return await institutionController.fetchDepartmentsByInstitute(id);

}
