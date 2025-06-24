import { NextRequest } from 'next/server';
import { MotherClassEnrollmentController } from '@/controllers/motherClassController';

const motherClassController = new MotherClassEnrollmentController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    console.log('motherclass');
    const { id } = params;
    return await motherClassController.getClassByInstitution(id);

}
