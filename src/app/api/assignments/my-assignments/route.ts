import { NextResponse, NextRequest } from "next/server";
import { AssignmentController } from "@/controllers/assignmentController";

export async function GET(req: NextRequest) {
  return AssignmentController.getMyAssignments(req);
}
