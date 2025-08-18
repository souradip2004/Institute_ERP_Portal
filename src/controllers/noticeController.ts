import { NextRequest, NextResponse } from "next/server";
import {NoticeService} from "@/services/noticeService";

const noticeService = new NoticeService();

export class NoticeController {
  async getNoticeById(req: NextRequest) {
    try {
      const id = req.nextUrl.searchParams.get('id');
      if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Invalid or missing notice ID' }, { status: 400 });
      }
      const notice = await noticeService.getNoticeById(id);
      if (!notice) {
        return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
      }
      return NextResponse.json(notice);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching notice:', error.message);
      } else {
        console.error('Error fetching notice:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching the notice' }, { status: 500 });
    }
  }

  async getNotices(req: NextRequest) {
    try {
      const notices = await noticeService.getNotices();
      return NextResponse.json(notices);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching notices:', error.message);
      } else {
        console.error('Error fetching notices:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching notices' }, { status: 500 });
    }
  }

  async createNotice(req: NextRequest,id: string) {
    try {
      const data = await req.json();
      const notice = await noticeService.createNotice(data,id);
      return NextResponse.json(notice, { status: 201 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error creating notice:', error.message);
      } else {
        console.error('Error creating notice:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while creating the notice' }, { status: 500 });
    }
  }

  async updateNotice(req: NextRequest) {
    try {
      const id = req.nextUrl.searchParams.get('id');
      if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Invalid or missing notice ID' }, { status: 400 });
      }
      
      const data = await req.json();
      const notice = await noticeService.updateNotice(id, data);
      return NextResponse.json(notice);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error updating notice:', error.message);
      } else {
        console.error('Error updating notice:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while updating the notice' }, { status: 500 });
    }
  }
  async getNoticeByInstitution(id: string) {
    try {
      const institutionId = id;
      if (!institutionId || typeof institutionId !== 'string') {
        return NextResponse.json({ error: 'Invalid or missing institution ID' }, { status: 400 });
      }
      const notices = await noticeService.getNoticesByInstitutionId(institutionId);
      return NextResponse.json(notices);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching notices by institution:', error.message);
      } else {
        console.error('Error fetching notices by institution:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching notices by institution' }, { status: 500 });
    }
  }
    async getNoticesByClassSection(req: NextRequest) {
        try {
        const classSectionId = req.nextUrl.searchParams.get('classSectionId');
        if (!classSectionId || typeof classSectionId !== 'string') {
            return NextResponse.json({ error: 'Invalid or missing class section ID' }, { status: 400 });
        }
        const notices = await noticeService.getNoticesByClassSectionId(classSectionId);
        return NextResponse.json(notices);
        } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error fetching notices by class section:', error.message);
        } else {
            console.error('Error fetching notices by class section:', error);
        }
        return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching notices by class section' }, { status: 500 });
        }
    }

    async deleteNotice(req: NextRequest) {
        try {
        const id = req.nextUrl.searchParams.get('id');
        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'Invalid or missing notice ID' }, { status: 400 });
        }
        const notice = await noticeService.deleteNotice(id);
        return NextResponse.json(notice, { status: 200 });
        } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error deleting notice:', error.message);
        } else {
            console.error('Error deleting notice:', error);
        }
        return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while deleting the notice' }, { status: 500 });
        }
    }

}
