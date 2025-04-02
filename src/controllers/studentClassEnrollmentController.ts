import { NextRequest, NextResponse } from 'next/server';
import { StudentClassEnrollmentService, CreateEnrollmentDTO, UpdateEnrollmentDTO } from '@/services/studentClassEnrollmentService';

const studentClassEnrollmentService = new StudentClassEnrollmentService();

export class StudentClassEnrollmentController {
  async getAllEnrollments(req: NextRequest) {
    try {
      const enrollments = await studentClassEnrollmentService.getAllEnrollments();
      return NextResponse.json(enrollments);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching enrollments:', error.message);
      } else {
        console.error('Error fetching enrollments:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching enrollments' }, { status: 500 });
    }
  }

  async createEnrollment(req: NextRequest) {
    try {
      const data = await req.json();
      const { studentId, classSectionId, enrollmentStatus } = data;

      if (!studentId || !classSectionId) {
        return NextResponse.json({ error: 'studentId and classSectionId are required' }, { status: 400 });
      }

      const createData: CreateEnrollmentDTO = { studentId, classSectionId, enrollmentStatus };
      const enrollment = await studentClassEnrollmentService.createEnrollment(createData);
      return NextResponse.json(enrollment, { status: 201 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error creating enrollment:', error.message);
      } else {
        console.error('Error creating enrollment:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while creating the enrollment' }, { status: 500 });
    }
  }

  async getEnrollmentById(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 });

      const enrollment = await studentClassEnrollmentService.getEnrollmentById(id);
      if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });

      return NextResponse.json(enrollment);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error fetching enrollment ${id}:`, error.message);
      } else {
        console.error(`Error fetching enrollment ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching the enrollment' }, { status: 500 });
    }
  }

  async updateEnrollment(id: string, req: NextRequest) {
    try {
      if (!id) return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 });

      const data = await req.json();
      const updateData: UpdateEnrollmentDTO = { enrollmentStatus: data.enrollmentStatus };

      const updatedEnrollment = await studentClassEnrollmentService.updateEnrollment(id, updateData);
      return NextResponse.json(updatedEnrollment);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error updating enrollment ${id}:`, error.message);
      } else {
        console.error(`Error updating enrollment ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while updating the enrollment' }, { status: 500 });
    }
  }

  async deleteEnrollment(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 });

      await studentClassEnrollmentService.deleteEnrollment(id);
      return NextResponse.json({ message: 'Enrollment deleted successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error deleting enrollment ${id}:`, error.message);
      } else {
        console.error(`Error deleting enrollment ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while deleting the enrollment' }, { status: 500 });
    }
  }
}