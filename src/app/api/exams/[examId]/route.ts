import { NextRequest, NextResponse } from "next/server";
import { ExamController } from "@/controllers/examController";

const examController = new ExamController();

export async function GET(
  req: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    const examId = params.examId;
    return await examController.getExamById(examId);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
