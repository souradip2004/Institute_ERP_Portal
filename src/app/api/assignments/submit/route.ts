import { NextRequest, NextResponse } from "next/server";
import { AssignmentController } from "@/controllers/assignmentController";

export async function POST(req: NextRequest) {
  return AssignmentController.submitAssignment(req);
}
