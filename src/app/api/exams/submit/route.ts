import { NextRequest, NextResponse } from "next/server";
import { ExamSubmissionController } from "@/controllers/examSubmissionController";

export async function POST(req: NextRequest) {
  try {
    const controller = new ExamSubmissionController()
    const response = await controller.create(req)
    
    return response;
  } catch (error: any) {
    console.log("Error:", error);
    return NextResponse.json(
      { error: "Failed to submit exam", details: error.message },
      { status: 500 }
    );
  }
}
