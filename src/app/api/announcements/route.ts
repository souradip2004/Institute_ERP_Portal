import { NextResponse } from 'next/server';
import { AnnouncementController } from '@/controllers/announcementController';
import { AuthUtils } from '@/utils/authUtils';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const user = await AuthUtils.getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = await AnnouncementController.createAnnouncement(user, body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await AuthUtils.getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const institutionId = searchParams.get('institutionId');
    const departmentId = searchParams.get('departmentId');
    const classSectionId = searchParams.get('classSectionId');
    const batchId = searchParams.get('batchId');

    const filters = {
      institutionId: institutionId ?? undefined,
      departmentId: departmentId ?? undefined,
      classSectionId: classSectionId ?? undefined,
      batchId: batchId ?? undefined,
    };

    const announcements = await AnnouncementController.getAnnouncements(user, filters);
    return NextResponse.json(announcements);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}