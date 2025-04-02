import { NextRequest, NextResponse } from 'next/server';
import { DepartmentHeadService } from '@/services/departmentHeadService';

const departmentHeadService = new DepartmentHeadService();

export class DepartmentHeadController {
  async getAll(req: NextRequest) {
    try {
      const departmentHeads = await departmentHeadService.getAll();
      return NextResponse.json(departmentHeads);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async create(req: NextRequest) {
    try {
      const data = await req.json();
      const departmentHead = await departmentHeadService.create(data);
      return NextResponse.json(departmentHead, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async getById(id: string) {
    try {
      const departmentHead = await departmentHeadService.getById(id);
      if (!departmentHead) {
        return NextResponse.json({ error: 'Department Head not found' }, { status: 404 });
      }
      return NextResponse.json(departmentHead);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async update(id: string, req: NextRequest) {
    try {
      const data = await req.json();
      const departmentHead = await departmentHeadService.update(id, data);
      return NextResponse.json(departmentHead);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async delete(id: string) {
    try {
      await departmentHeadService.delete(id);
      return NextResponse.json({ message: 'Department Head deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

    async getDeptHeadByDepartment(departmentId: string) {
    try {
      const hod = await departmentHeadService.fetchDeptHeadByDepartment(departmentId);
      // console.log('hod: ');
      // console.log(hod);
      if (!hod) {
        return NextResponse.json({ error: 'Department Head not found' }, { status: 210 });
      }
      return NextResponse.json({hod, message: 'Department Head detail fetch successfully' });
    } catch (error: any) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
