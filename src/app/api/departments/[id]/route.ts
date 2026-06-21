import { NextRequest} from 'next/server';
import { DepartmentController } from '@/controllers/departmentController';

const departmentController = new DepartmentController();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return departmentController.getDepartmentById(params.id);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return departmentController.updateDepartment(params.id, req);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return departmentController.deleteDepartment(params.id);
}