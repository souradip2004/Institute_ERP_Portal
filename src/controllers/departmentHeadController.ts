import { NextRequest, NextResponse } from 'next/server';
import { DepartmentHeadService } from '@/services/departmentHeadService';

const departmentHeadService = new DepartmentHeadService();

export class DepartmentHeadController {
  async getAllDepartmentHeads(req: NextRequest) {
    try {
      const departmentHeads = await departmentHeadService.getAllDepartmentHeads();
      return NextResponse.json(departmentHeads);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async createDepartmentHead(req: NextRequest) {
    try {
      const data = await req.json();
      const departmentHead = await departmentHeadService.createDepartmentHead(data);
      return NextResponse.json(departmentHead, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getDepartmentHeadById(id: string) {
    try {
      const departmentHead = await departmentHeadService.getDepartmentHeadById(id);
      if (!departmentHead) {
        return NextResponse.json({ error: 'Department Head not found' }, { status: 404 });
      }
      return NextResponse.json(departmentHead);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async updateDepartmentHead(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const departmentHead = await departmentHeadService.updateDepartmentHead(id, data);
      return NextResponse.json(departmentHead);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async deleteDepartmentHead(id: string) {
    try {
      await departmentHeadService.deleteDepartmentHead(id);
      return NextResponse.json({ message: 'Department Head deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
