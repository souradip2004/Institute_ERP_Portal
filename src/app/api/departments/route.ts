import { NextRequest, NextResponse } from 'next/server';
import { DepartmentController } from '@/controllers/departmentController';

const departmentController = new DepartmentController();

export async function GET() {
  return await departmentController.getAllDepartments();
}

export async function POST(req: NextRequest) {
  return await departmentController.createDepartment(req);
}
