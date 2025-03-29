import { NextRequest, NextResponse } from 'next/server';
import { DepartmentService } from '@/services/departmentService';

const departmentService = new DepartmentService();

export class DepartmentController {
  async getAllDepartments() {
    try {
      const departments = await departmentService.getAllDepartments();
      return NextResponse.json(departments);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async createDepartment(req: NextRequest) {
    try {
      const data = await req.json();
      const department = await departmentService.createDepartment(data);
      return NextResponse.json(department, { status: 201 });
    } catch (error: any) {
      console.error('Error creating department:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async getDepartmentById(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });

      const department = await departmentService.getDepartmentById(id);
      if (!department) return NextResponse.json({ error: 'Department not found' }, { status: 404 });

      return NextResponse.json(department);
    } catch (error: any) {
      console.error('Error fetching department by ID:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async updateDepartment(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      if (!id) return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });

      const department = await departmentService.updateDepartment(id, data);
      return NextResponse.json(department);
    } catch (error: any) {
      console.error('Error updating department:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async deleteDepartment(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });

      await departmentService.deleteDepartment(id);
      return NextResponse.json({ message: 'Department deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting department:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}
