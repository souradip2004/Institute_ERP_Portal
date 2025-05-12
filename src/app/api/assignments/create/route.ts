import { NextRequest, NextResponse } from "next/server";
import { AssignmentController } from "@/controllers/assignmentController";

export async function POST(req: NextRequest) {
  // Check content type to determine if it's JSON
  const contentType = req.headers.get("content-type") || "";
  
  if (contentType.includes("application/json")) {
    console.log("JSON request detected");
    return AssignmentController.createAssignmentJson(req);
  } else {
    return AssignmentController.createAssignment(req);
  }
}
