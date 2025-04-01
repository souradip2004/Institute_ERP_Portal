import { NextRequest} from 'next/server';
import { DepartmentController } from '@/controllers/departmentController';

const departmentController = new DepartmentController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return departmentController.getDepartmentById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return departmentController.updateDepartment(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return departmentController.deleteDepartment(params.id);
}