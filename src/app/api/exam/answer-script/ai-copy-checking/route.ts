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

    const teacher = await prisma.teacher.findUnique({where: {id: teacherId}});
    if (!teacher) {
      return NextResponse.json({error: "Teacher record not found"}, {status: 403});
    }
    const student = await prisma.student.findFirst({where: {id: studentId}});
    if (!student) {
      return NextResponse.json({error: "Student record not found"}, {status: 403});
    }

    const examSubmission = await prisma.examSubmission.findUnique({
      where: {id, studentId},
      include: {
        answerScripts: {
          orderBy: {question: {id: 'asc'}},
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
                diagramImgURL: true,
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

    // console.log("Exam submission ", examSubmission);
    if (examSubmission.status === 'GRADED') {
      return NextResponse.json({error: "Exam already graded"}, {status: 400});
    }

    const longAnswerScripts = examSubmission.answerScripts.filter(
      script => script.question.questionType === 'LONG_ANSWER'
    );

    const aiScores = new Map<string, number>();

    if (longAnswerScripts.length > 0) {
      const scriptsForAIGrading = [];
      for (const script of longAnswerScripts) {
        if (script.answerImgURL && script.answerImgURL.length > 0) {
          try {
            const ocrResponse = await axios.post('https://py.aiclassroom.in/imgs2ocr2/', {
              file_url_list: script.answerImgURL
            });
            script.studentAnswer = ocrResponse.data["OCR DATA"] || "";
          } catch (ocrError) {
            console.error("Error during OCR processing for script ID:", script.id, ocrError);
            script.studentAnswer = "";
          }
        }

        if (!script.studentAnswer) {
          aiScores.set(script.id, 0);
        } else {
          scriptsForAIGrading.push(script);
        }
      }

      const textOnlyScripts = scriptsForAIGrading.filter(s => !s.question.diagramImgURL || s.question.diagramImgURL.length === 0);
      const diagramScripts = scriptsForAIGrading.filter(s => s.question.diagramImgURL && s.question.diagramImgURL.length > 0);

      if (textOnlyScripts.length > 0) {
        // This part remains the same as before
        const modelAns: Record<string, string[][]> = {};
        const studentAns: Record<string, string[][]> = {};
        const configJson: Record<string, [number, string, number, number]> = {};

        textOnlyScripts.forEach((script, index) => {
          const key = String(index + 1);
          modelAns[key] = [[script.question.correctAnswer[0] || ""]];
          studentAns[key] = [[script.studentAnswer || ""]];
          configJson[key] = [script.question.marks || 0, script.question.difficultyLevel || "Hard", 0, 0];
        });

        const payload = {
          model_json_anskey: JSON.stringify(modelAns),
          student_json_ans: JSON.stringify(studentAns),
          config_json: JSON.stringify(configJson)
        };

        const response = await axios.post('https://answer-checking-4-dad1d16-v3.app.beam.cloud', payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer cpxjIHGyDUggeCZSEgd7TSs_xuIaJLxQyplSlPcpEv35qftljIUmetr9Drtj_MUyC9PUSJLvV1vbjljWohB8Sw=='
          }
        });

        const rawResults = response.data.final_results_data;
        const parsedScores = JSON.parse(rawResults[2]);
        textOnlyScripts.forEach((script, index) => {
          const key = String(index + 1);
          const score = Number((parsedScores[key]?.[`Updated_Score (?/${script.question.marks})`] ?? 0).toFixed(2));
          aiScores.set(script.id, score);
        });
      }

      if (diagramScripts.length > 0) {
        const modelAns: Record<string, string[][]> = {};
        const studentAns: Record<string, string[][]> = {};
        const configJson: Record<string, [number, string, number, number]> = {};
        console.log("Diagram scripts ", diagramScripts);

        diagramScripts.forEach((script, index) => {
          const key = String(index + 1);
          const halfMarks = (script.question.marks || 0) * 0.5;
          modelAns[key] = [[script.question.correctAnswer[0] || ""]];
          studentAns[key] = [[script.studentAnswer || ""]];
          configJson[key] = [halfMarks, script.question.difficultyLevel || "Hard", 0, 0];
        });

        const initialPayload = {
          model_json_anskey: JSON.stringify(modelAns),
          student_json_ans: JSON.stringify(studentAns),
          config_json: JSON.stringify(configJson)
        };

        console.log("Text checking payload ", initialPayload);

        const initialResponse = await axios.post('https://answer-checking-4-dad1d16-v3.app.beam.cloud',
          initialPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer cpxjIHGyDUggeCZSEgd7TSs_xuIaJLxQyplSlPcpEv35qftljIUmetr9Drtj_MUyC9PUSJLvV1vbjljWohB8Sw=='
            }
          });

        console.log("Initial text answer ", initialResponse.data);

        const initialRawResults = initialResponse.data.final_results_data;
        const parsedInitialScores = JSON.parse(initialRawResults[2]);

        // Step B: Call diagram API for each script with retry logic
        for (const [index, script] of diagramScripts.entries()) {
          if (!script.diagramImgURL || script.diagramImgURL.length === 0) {
            aiScores.set(script.id, 0);
            continue;
          }

          const key = String(index + 1);
          const halfMarks = (script.question.marks || 0) * 0.5;
          console.log("Script ", script, " ", parsedInitialScores[key]);
          console.log("Updated_written_score ", parsedInitialScores[key]?.[`Updated_Score (?/${halfMarks})`])
          const writtenScore = Number((parsedInitialScores[key]?.[`Updated_Score (?/${halfMarks})`] ?? 0).toFixed(2));
          console.log("Written score ", writtenScore);
          const initialScoreObject = parsedInitialScores[key];

          const diagramPayload = {
            question_no: 1,
            student_img_url: script.diagramImgURL[0],
            ans_key_json: JSON.stringify({"1": [[script.question.correctAnswer[0] || ""]]}),
            diagram_data: {
              "1": {
                text: [[script.question.correctAnswer[0] || ""]],
                diagram: [script.question.diagramImgURL]
              }
            },
            updated_scores_json: JSON.stringify({"1": initialScoreObject}),
            config_json: JSON.stringify({"1": [halfMarks, script.question.difficultyLevel || "Hard", 0, halfMarks, "FigBased_y"]})
          };

          console.log("Diagram api payload ", diagramPayload);

          let finalScore = 0;
          for (let attempt = 1; attempt <= 5; attempt++) {
            if (attempt >= 1 && attempt <= 5) {
              const delay = Math.random() * 2000 + 4000; // 4 to 6 seconds
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            console.log("No of attempt ", attempt);
            try {
              const diagramResponse = await axios.post('https://answer-and-diagram-checking-5-v2-41923a7-v1.app.beam.cloud',
                diagramPayload,
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer cpxjIHGyDUggeCZSEgd7TSs_xuIaJLxQyplSlPcpEv35qftljIUmetr9Drtj_MUyC9PUSJLvV1vbjljWohB8Sw=='
                  }
                }
              );

              const finalResult = JSON.parse(diagramResponse.data.final_RESULT_JSON);

              console.log("Diagram response ", finalResult);
              const score = finalResult["1"]?.[`Diagram Final Score (?/10)`];
              console.log("Score ", score);

              if (score !== undefined && score !== null) {
                finalScore = finalResult["1"]?.[`Updated_Score (?/${halfMarks})`];
                // console.log("Final score ", finalScore);
                break;
              }
            } catch (apiError) {
              console.error(`Attempt ${attempt} failed for diagram API call for script ${script.id}:`, apiError);
            }
          }
          aiScores.set(script.id, finalScore + writtenScore);
        }
      }
    }

    let totalMarks = 0;
    const updatePromises = examSubmission.answerScripts.map(script => {
      let score = 0;
      let isAiGraded = false;

      switch (script.question.questionType) {
        case 'LONG_ANSWER':
          score = aiScores.get(script.id) || 0;
          isAiGraded = true;
          break;
        case 'MCQ':
          if (script.question.correctAnswer.includes(script.studentAnswer)) {
            score = script.question.marks;
          }
          break;
      }
      totalMarks += score;

      return prisma.answerScript.update({
        where: {id: script.id},
        data: {obtainedMarks: score, status: "GRADED", isAiGraded, gradedById: teacherId, gradedAt: new Date()},
      });
    });

    await Promise.all(updatePromises);

    const updatedSubmission = await prisma.examSubmission.update({
      where: {id: examSubmission.id},
      data: {
        obtainedMarks: Number(totalMarks.toFixed(2)),
        status: "GRADED",
        gradedById: teacherId,
        gradedAt: new Date()
      },
    });

    return NextResponse.json(updatedSubmission, {status: 200});

  } catch (error: any) {
    console.error("Error during AI grading:", error);
    return NextResponse.json(
      {error: "Failed to grade exam", details: error.message},
      {status: 500}
    );
  }
}