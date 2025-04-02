import { NextRequest, NextResponse } from 'next/server';
import { DepartmentHeadController } from '@/controllers/departmentHeadController';

const departmentHeadController = new DepartmentHeadController();

export async function GET(req: NextRequest) {
  return departmentHeadController.getAll(req);
}

export async function POST(req: NextRequest) {
  return departmentHeadController.create(req);
}
