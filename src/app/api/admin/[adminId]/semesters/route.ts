import { NextResponse } from 'next/server';
import {getSemesters} from '@/services/teacherCourseSectionService';

export async function GET(request: Request, props: { params: Promise<{ adminId: string }> }) {
    const params = await props.params;

    const url = new URL(request.url);
    console.log('url: ', url.toString());
    const { adminId } = params;
    try {
        const semesters = await getSemesters(adminId);
        return NextResponse.json(semesters);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}