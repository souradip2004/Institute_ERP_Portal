import { NextRequest } from 'next/server';
import { MotherClassEnrollmentController } from '@/controllers/motherClassController';

const motherClassController = new MotherClassEnrollmentController();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    console.log('motherclass');
    const { id } = params;
    return await motherClassController.getClassByInstitution(id);
}
