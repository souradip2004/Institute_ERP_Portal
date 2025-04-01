import { NextRequest} from 'next/server';
import { DepartmentController } from '@/controllers/departmentController';

const departmentController = new DepartmentController();

export async function GET(req: NextRequest) {
  return departmentController.getAllDepartments(req);
}

export async function POST(req: NextRequest) {
  return departmentController.createDepartment(req);
}