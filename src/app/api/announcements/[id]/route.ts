import { NextResponse } from 'next/server';
import { AnnouncementController } from '@/controllers/announcementController';
import { AuthUtils } from '@/utils/authUtils';
import { NextRequest } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await AuthUtils.getCurrentUser(req);
    

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = await AnnouncementController.updateAnnouncement(user, params.id, body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await AuthUtils.getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await AnnouncementController.deleteAnnouncement(user, params.id);
    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}