import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import axios from "axios";

export async function GET(
  req: NextRequest
) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id') as string;
    const studentId = searchParams.get('studentId') as string;
    const teacherId = searchParams.get('teacherId') as string;

    if (!id || !studentId || !teacherId) {
      return NextResponse.json(
        {error: "Missing required parameters: id, studentId, and teacherId"},
        {status: 400}
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: {id: teacherId}
    });

    if (!teacher) {
      return NextResponse.json({error: "Teacher record not found"}, {status: 403});
    }

    const student = await prisma.student.findFirst({
      where: {id: studentId}
    });

    if (!student) {
      return NextResponse.json({error: "Student record not found"}, {status: 403});
    }

    const examSubmission = await prisma.examSubmission.findUnique({
      where: {
        id: id,
        studentId: studentId,
      },
      include: {
        answerScripts: {
          orderBy: {
            question: {
              // This orderBy is crucial for maintaining order.
              id: 'asc'
            }
          },
          select: {
            id: true,
            studentAnswer: true,
            answerImgURL: true,
            diagramImgURL: true,
            status: true,
            question: {
              select: {
                id: true,
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
      return NextResponse.json({error: "Exam submission not found"}, {status: 404});
    }

    if (examSubmission.status === 'GRADED') {
      return NextResponse.json({error: "Exam already graded"}, {status: 400});
    }

    // Step 1: Isolate long-answer scripts to prepare the AI payload.
    const longAnswerScripts = examSubmission.answerScripts.filter(
      script => script.question.questionType === 'LONG_ANSWER'
    );

    // This map will hold the AI-calculated scores, keyed by the answer script's ID for accuracy.
    const aiScores = new Map<string, number>();

    // Step 2: If there are long-answer questions, send them to the AI service.
    if (longAnswerScripts.length > 0) {
      const modelAns: Record<string, string[][]> = {};
      const studentAns: Record<string, string[][]> = {};
      const configJson: Record<string, [number, string, number, number]> = {};


      longAnswerScripts.forEach((script, index) => {
        const key = String(index + 1);
        modelAns[key] = [[script.question.correctAnswer[0] || ""]];
        studentAns[key] = [[script.studentAnswer || ""]];
        configJson[key] = [
          script.question.marks || 0,
          script.question.difficultyLevel || "Hard",
          0,
          0
        ];
      });

      const payload = {
        model_json_anskey: JSON.stringify(modelAns),
        student_json_ans: JSON.stringify(studentAns),
        config_json: JSON.stringify(configJson)
      };

      const response = await axios.post(
        'https://answer-checking-4-dad1d16-v3.app.beam.cloud',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer cpxjIHGyDUggeCZSEgd7TSs_xuIaJLxQyplSlPcpEv35qftljIUmetr9Drtj_MUyC9PUSJLvV1vbjljWohB8Sw=='
          }
        }
      );

      const rawResults = response.data.final_results_data;
      const parsedScores = JSON.parse(rawResults[2]);

      // Map the AI results back to our answer scripts using their original order and unique ID.
      longAnswerScripts.forEach((script, index) => {
        const key = String(index + 1);
        const score = Number((parsedScores[key]?.[`Updated_Score (?/${script.question.marks})`] ?? 0).toFixed(2));
        aiScores.set(script.id, score); // Use the script's unique ID as the key in our map.
      });
    }

    let totalMarks = 0;
    const updatePromises = examSubmission.answerScripts.map(script => {
      let score = 0;
      const isAiGraded = true;

      if (script.question.questionType === 'LONG_ANSWER') {
        score = aiScores.get(script.id) || 0;
      } else if (script.question.questionType === 'MCQ') {
        if (script.question.correctAnswer.includes(script.studentAnswer)) {
          score = script.question.marks;
        }
      }
      // You can add more grading logic for other question types here.

      totalMarks += score;

      // Return the promise for this update.
      return prisma.answerScript.update({
        where: { id: script.id },
        data: {
          obtainedMarks: score,
          status: "GRADED",
          isAiGraded: isAiGraded,
          gradedById: teacherId,
          gradedAt: new Date()
        },
      });
    });

    // Step 4: Execute all database updates.
    await Promise.all(updatePromises);

    // Step 5: Finalize the submission with the total marks.
    totalMarks = Number(totalMarks.toFixed(2));
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

    // Note: The frontend must re-fetch the submission data after grading.
    // To see the correct order, it must use the same 'orderBy' clause used in this function.
    return NextResponse.json(updatedSubmission, {status: 200});

  } catch (error: any) {
    console.error("Error during AI grading:", error);
    return NextResponse.json(
      {error: "Failed to grade exam", details: error.message},
      {status: 500}
    );
  }
}