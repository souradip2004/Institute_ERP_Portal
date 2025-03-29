import { NextRequest, NextResponse } from 'next/server';
import { DepartmentHeadController } from '@/controllers/departmentHeadController';

const departmentHeadController = new DepartmentHeadController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return departmentHeadController.getDepartmentHeadById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return departmentHeadController.updateDepartmentHead(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return departmentHeadController.deleteDepartmentHead(params.id);
}
