import { NextRequest, NextResponse } from 'next/server';
import { DepartmentService, CreateDepartmentDTO, UpdateDepartmentDTO, DepartmentFilter } from '@/services/departmentService';

const departmentService = new DepartmentService();

export class DepartmentController {
  async getAllDepartments(req: NextRequest) {
    try {
      const url = new URL(req.url);
      const institutionId = url.searchParams.get('institutionId') || undefined;
      const filters: DepartmentFilter = { institutionId };

      const departments = await departmentService.getAllDepartments(filters);
      return NextResponse.json(departments);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching departments:', error.message);
      } else {
        console.error('Error fetching departments:', error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching departments' }, { status: 500 });
    }
  }

  async createDepartment(req: NextRequest) {
    try {
      const data = await req.json();
      const { name, code, description, institutionId } = data;

      if (!institutionId) {
        return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 });
      }

      const createData: CreateDepartmentDTO = { name, code, description, institutionId };
      const department = await departmentService.createDepartment(createData);
      return NextResponse.json(department, { status: 201 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error creating department:', error.message);
      } else {
        console.error('Error creating department:', error);
      }
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message || 'An error occurred while creating the department' }, { status: error.message.includes('already exists') ? 409 : 500 });
      } else {
        return NextResponse.json({ error: 'An unknown error occurred while creating the department' }, { status: 500 });
      }
    }
  }

  async getDepartmentById(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });

      const department = await departmentService.getDepartmentById(id);
      if (!department) return NextResponse.json({ error: 'Department not found' }, { status: 404 });

      return NextResponse.json(department);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error fetching department ${id}:`, error.message);
      } else {
        console.error(`Error fetching department ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while fetching the department' }, { status: 500 });
    }
  }

  async updateDepartment(id: string, req: NextRequest) {
    try {
      if (!id) return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });

      const data = await req.json();
      const updateData: UpdateDepartmentDTO = {
        name: data.name,
        code: data.code,
        description: data.description,
      };

      const updatedDepartment = await departmentService.updateDepartment(id, updateData);
      return NextResponse.json(updatedDepartment);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error updating department ${id}:`, error.message);
      } else {
        console.error(`Error updating department ${id}:`, error);
      }
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message || 'An error occurred while updating the department' }, { status: error.message.includes('already exists') ? 409 : 500 });
      } else {
        return NextResponse.json({ error: 'An unknown error occurred while updating the department' }, { status: 500 });
      }
    }
  }

  async deleteDepartment(id: string) {
    try {
      if (!id) return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });

      await departmentService.deleteDepartment(id);
      return NextResponse.json({ message: 'Department deleted successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error deleting department ${id}:`, error.message);
      } else {
        console.error(`Error deleting department ${id}:`, error);
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred while deleting the department' }, { status: 500 });
    }
  }
}