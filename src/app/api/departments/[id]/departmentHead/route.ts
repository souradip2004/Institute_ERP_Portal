import { NextRequest, NextResponse } from "next/server";
import { DepartmentHeadController } from "@/controllers/departmentHeadController";

const deptHeadController = new DepartmentHeadController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  
        const { id } = await params;
        const deptHead = await deptHeadController.getDeptHeadByDepartment(id);
        return deptHead;
   
}
