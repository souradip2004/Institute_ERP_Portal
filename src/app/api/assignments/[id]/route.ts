import { NextRequest, NextResponse } from "next/server";
import { AssignmentController } from "@/controllers/assignmentController";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return AssignmentController.getAssignmentById(req, params.id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return AssignmentController.deleteAssignment(req, params.id);
}
