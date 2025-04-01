import { NextRequest, NextResponse } from 'next/server';
import { ClassSectionService, CreateClassSectionDTO, UpdateClassSectionDTO, ClassSectionFilter } from '@/services/classSectionService';

const classSectionService = new ClassSectionService();

export class ClassSectionController {
  async getAllClassSections(req: NextRequest) {
    try {
      const url = new URL(req.url);
      const batchId = url.searchParams.get('batchId') || undefined;
      const courseId = url.searchParams.get('courseId') || undefined;
      const filters: ClassSectionFilter = { batchId, courseId };

      const classSections = await classSectionService.getAllClassSections(filters);
      return NextResponse.json(classSections);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching class sections:', error.message);
      } else {
        console.error('Error fetching class sections:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching class sections' }, { status: 500 });
    }
  }

  async createClassSection(req: NextRequest) {
    try {
      const data = await req.json();
      const { sectionName, batchId, courseId, semesterId, teacherId, maxStudents } = data;

      if (!batchId || !courseId || !semesterId || !teacherId) {
        return NextResponse.json({ error: 'batchId, courseId, semesterId, and teacherId are required' }, { status: 400 });
      }

      const createData: CreateClassSectionDTO = { sectionName, batchId, courseId, semesterId, teacherId, maxStudents };
      const classSection = await classSectionService.createClassSection(createData);
      return NextResponse.json(classSection, { status: 201 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error creating class section:', error.message);
      } else {
        console.error('Error creating class section:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while creating the class section' }, { status: 500 });
    }
  }

  async getClassSectionById(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Class Section ID is required' }, { status: 400 });

      const classSection = await classSectionService.getClassSectionById(id);
      if (!classSection) return NextResponse.json({ error: 'Class Section not found' }, { status: 404 });

      return NextResponse.json(classSection);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error fetching class section ${id}:`, error.message);
      } else {
        console.error(`Error fetching class section ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching the class section' }, { status: 500 });
    }
  }

  async updateClassSection(id: string, req: NextRequest) {
    try {
      if (!id) return NextResponse.json({ error: 'Class Section ID is required' }, { status: 400 });

      const data = await req.json();
      const updateData: UpdateClassSectionDTO = {
        sectionName: data.sectionName,
        batchId: data.batchId,
        courseId: data.courseId,
        semesterId: data.semesterId,
        teacherId: data.teacherId,
        maxStudents: data.maxStudents,
      };

      const updatedClassSection = await classSectionService.updateClassSection(id, updateData);
      return NextResponse.json(updatedClassSection);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error updating class section ${id}:`, error.message);
      } else {
        console.error(`Error updating class section ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while updating the class section' }, { status: 500 });
    }
  }

  async deleteClassSection(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Class Section ID is required' }, { status: 400 });

      await classSectionService.deleteClassSection(id);
      return NextResponse.json({ message: 'Class Section deleted successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error deleting class section ${id}:`, error.message);
      } else {
        console.error(`Error deleting class section ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while deleting the class section' }, { status: 500 });
    }
  }
}