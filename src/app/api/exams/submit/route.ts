import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { examId, studentId, answers, score } = await req.json();
    
    // Instead of saving to database, just return success with the score
    return NextResponse.json({ 
      success: true, 
      submission: {
        id: Math.random().toString(36).substring(7),
        examId,
        studentId,
        score: score,
        status: 'COMPLETED',
        submittedAt: new Date()
      }
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to submit exam", details: error.message },
      { status: 500 }
    );
  }
}
