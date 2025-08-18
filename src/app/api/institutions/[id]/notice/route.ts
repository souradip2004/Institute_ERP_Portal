import { NextRequest } from 'next/server';
import { NoticeController } from '@/controllers/noticeController';

const institutionController = new NoticeController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    console.log('hi from institution dept');
    const { id } = await params;
    return await institutionController.getNoticeByInstitution(id);
}
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    console.log('hi from institution dept');
    const { id } = await params;
    return await institutionController.createNotice(req, id);
}
