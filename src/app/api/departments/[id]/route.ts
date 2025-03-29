import { NextRequest, NextResponse } from 'next/server';
import { DepartmentController } from '@/controllers/departmentController';

const departmentController = new DepartmentController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!params.id) {
    return NextResponse.json({ error: 'Invalid Department ID' }, { status: 400 });
  }
  return await departmentController.getDepartmentById(params.id);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!params.id) {
    return NextResponse.json({ error: 'Invalid Department ID' }, { status: 400 });
  }
  return await departmentController.updateDepartment(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!params.id) {
    return NextResponse.json({ error: 'Invalid Department ID' }, { status: 400 });
  }
  return await departmentController.deleteDepartment(params.id);
}
