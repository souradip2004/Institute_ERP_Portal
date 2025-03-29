import { NextRequest, NextResponse } from 'next/server';
import { ClassSectionService } from '@/services/classSectionService';

const classSectionService = new ClassSectionService();

export class ClassSectionController {
  async getAllClassSections(req: NextRequest) {
    try {
      const classSections = await classSectionService.getAllClassSections();
      return NextResponse.json(classSections);
    } catch (error: any) {
      console.error('Error fetching class sections:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async createClassSection(req: NextRequest) {
    try {
      const data = await req.json();
      const classSection = await classSectionService.createClassSection(data);
      return NextResponse.json(classSection, { status: 201 });
    } catch (error: any) {
      console.error('Error creating class section:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async getClassSectionById(classSectionId: string) {
    try {
      if (!classSectionId) {
        return NextResponse.json({ error: 'Class Section ID is required' }, { status: 400 });
      }

      const classSection = await classSectionService.getClassSectionById(classSectionId);
      if (!classSection) {
        return NextResponse.json({ error: 'Class Section not found' }, { status: 404 });
      }

      return NextResponse.json(classSection);
    } catch (error: any) {
      console.error('Error fetching class section by ID:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async updateClassSection(classSectionId: string, req: NextRequest) {
    try {
      if (!classSectionId) {
        return NextResponse.json({ error: 'Class Section ID is required' }, { status: 400 });
      }

      const data = await req.json();
      const classSection = await classSectionService.updateClassSection(classSectionId, data);
      return NextResponse.json(classSection);
    } catch (error: any) {
      console.error('Error updating class section:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async deleteClassSection(classSectionId: string) {
    try {
      if (!classSectionId) {
        return NextResponse.json({ error: 'Class Section ID is required' }, { status: 400 });
      }

      await classSectionService.deleteClassSection(classSectionId);
      return NextResponse.json({ message: 'Class Section deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting class section:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}
