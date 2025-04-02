import { NextRequest, NextResponse } from 'next/server';
import { DepartmentHeadController } from '@/controllers/departmentHeadController';

const departmentHeadController = new DepartmentHeadController();

// Get by departmentHead_id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return departmentHeadController.getById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return departmentHeadController.update(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return departmentHeadController.delete(params.id);
}
