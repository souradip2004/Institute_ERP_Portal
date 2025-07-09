import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();
    const {feedback, answerScripts, submissionId, teacherId} = body;

    if (!Array.isArray(answerScripts) || answerScripts.length === 0) {
      return new NextResponse(JSON.stringify({error: "Request body must contain a non-empty 'answerScripts' array."}), {status: 400});
    }

    for (const answer of answerScripts) {
      if (answer.id === undefined || answer.obtainedMarks === undefined) {
        return new NextResponse(JSON.stringify({error: "Each script must have an 'id' and 'obtainedMarks'."}), {status: 400});
      }

      await prisma.answerScript.update({
        where: {
          id: answer.id,
          examSubmissionId: submissionId,
        },
        data: {
          obtainedMarks: answer.obtainedMarks,
          status: "GRADED",
          remarks: answer.remarks,
          gradedById: teacherId,
          gradedAt: new Date()
        },
      });
    }

    const totalObtainedMarks = answerScripts.reduce(
      (sum, script) => sum + script.obtainedMarks,
      0
    );

    const updatedSubmission = await prisma.examSubmission.update({
      where: {
        id: submissionId,
      },
      data: {
        obtainedMarks: totalObtainedMarks,
        feedback: feedback,
        status: "GRADED",
        gradedById: teacherId,
        gradedAt: new Date()
      },
    });

    return NextResponse.json(updatedSubmission, {status: 200});

  } catch (error) {
    console.error("Failed to grade submission:", error);
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
      return new NextResponse(JSON.stringify({error: "Record not found. Please check submission and script IDs."}), {status: 404});
    }
    return new NextResponse(JSON.stringify({error: "An internal server error occurred."}), {status: 500});
  }
}