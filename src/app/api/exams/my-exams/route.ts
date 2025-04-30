import { NextResponse, NextRequest } from "next/server";
import { ExamController } from "@/controllers/examController";

export async function GET(req: NextRequest) {
  try {
    console.log("Starting my-exams API endpoint");

    // Create a new controller instance
    const controller = new ExamController();
    console.log("Controller instance created");

    // Call the getMyExams method
    const response = await controller.getMyExams(req);
    console.log("Successfully processed my-exams request");

    return response;
  } catch (error) {
    console.error("Error in my-exams route handler:", error);
    return NextResponse.json(
      { error: "Internal server error in route handler" },
      { status: 500 }
    );
  }
}
