import { NextRequest, NextResponse } from 'next/server';
import { StudentClassEnrollmentService } from '@/services/studentClassEnrollmentService';

const studentClassEnrollmentService = new StudentClassEnrollmentService();

export class StudentClassEnrollmentController {
  async getAllEnrollments() {
    try {
      const enrollments = await studentClassEnrollmentService.getAllEnrollments();
      return NextResponse.json(enrollments);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async createEnrollment(req: NextRequest) {
    try {
      const data = await req.json();
      const enrollment = await studentClassEnrollmentService.createEnrollment(data);
      return NextResponse.json(enrollment, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getEnrollmentById(id: string) {
    try {
      const enrollment = await studentClassEnrollmentService.getEnrollmentById(id);
      if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
      }
      return NextResponse.json(enrollment);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async updateEnrollment(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const enrollment = await studentClassEnrollmentService.updateEnrollment(id, data);
      return NextResponse.json(enrollment);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async deleteEnrollment(id: string) {
    try {
      await studentClassEnrollmentService.deleteEnrollment(id);
      return NextResponse.json({ message: 'Enrollment deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
