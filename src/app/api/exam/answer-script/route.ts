import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import axios from "axios";
import jwt from 'jsonwebtoken';
import {headers} from "next/headers";

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  req: NextRequest
) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id') as string;
    const examId = searchParams.get('examId') as string;
    const studentId = searchParams.get('studentId') as string;
    const teacherId = searchParams.get('teacherId') as string;

    if (!id || !studentId || !teacherId) {
      return NextResponse.json(
        {error: "Missing required parameters: id, examId, and studentId"},
        {status: 400}
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: {id: teacherId}
    })

    if (!teacher) {
      return NextResponse.json({error: "Teacher record not found"}, {status: 403});
    }
    // Get teacher record
    const student = await prisma.student.findFirst({
      where: {id: studentId}
    });
    if (!student) {
      return NextResponse.json({error: "Student record not found"}, {status: 403});
    }

    // Get the exam with detailed question information
    const examSubmission = await prisma.examSubmission.findUnique({
      where: {
        id: id,
        studentId: studentId,
      },
      include: {
        answerScripts: {
          select: {
            id: true,
            studentAnswer: true,
            question: {
              select: {
                questionText: true,
                questionType: true,
                correctAnswer: true,
                marks: true,
                difficultyLevel: true
              }
            }
          }
        }
      }
    });

    if (!examSubmission) {
      return NextResponse.json({error: "Exam not found"}, {status: 404});
    }
    const modelAns: Record<string, string[][]> = {};
    const studentAns: Record<string, string[][]> = {};
    const configJson: Record<string, [number, string, number, number]> = {};

    examSubmission.answerScripts.forEach((script, index) => {
      const key = String(index + 1); // "1", "2", ...
      modelAns[key] = [[script.question.correctAnswer[0] as string || ""]];
      studentAns[key] = [[script.studentAnswer || ""]];
      configJson[key] = [
        script.question.marks || 0,
        script.question.difficultyLevel || "Medium",
        0,
        0
      ];
    });

// Convert to nested JSON strings
    const payload = {
      model_json_anskey: JSON.stringify(modelAns, null, 2),
      student_json_ans: JSON.stringify(studentAns, null, 2),
      config_json: JSON.stringify(configJson, null, 2)
    };

    const response = await axios.post(
      'https://answer-checking-4-89f26c7-v4.app.beam.cloud',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ALXP7mhHyKz1MQATKH7CIQXK9VQBpvoNNuxPvLONWyPCfgemj18cz2T74r4drBpvOkf-3orOQT_6r-63mHPZAA=='
        },
      }
    );

    console.log("Response:", response.data);
    const rawResults = response.data.final_results_data;

    const parsedScores = JSON.parse(rawResults[2]);

    const index = 1;
    let totalMarks = 0;
    for (const answer of examSubmission.answerScripts) {
      if (answer.id === undefined) {
        return new NextResponse(JSON.stringify({error: "Each script must have an 'id' and 'obtainedMarks'."}), {status: 400});
      }

      const key = String(index );
      const score = Number(parsedScores[key]?.[`Updated_Score (?/${answer.question.marks})`] ?? 0);
      totalMarks += score;
      await prisma.answerScript.update({
        where: {
          id: answer.id,
          examSubmissionId: examSubmission.id,
        },
        data: {
          obtainedMarks: score,
          status: "GRADED",
          isAiGraded: true,
          gradedById: teacherId,
          gradedAt: new Date()
        },
      });

      index++;
    }


    const updatedSubmission = await prisma.examSubmission.update({
      where: {
        id: examSubmission.id,
      },
      data: {
        obtainedMarks: totalMarks,
        status: "GRADED",
        gradedById: teacherId,
        gradedAt: new Date()
      },
    });

    return NextResponse.json(updatedSubmission, {status: 200});

  } catch (error: any) {
    console.error("Error fetching exam details:", error);
    return NextResponse.json(
      {error: "Failed to fetch exam details", details: error.message},
      {status: 500}
    );
  }
}