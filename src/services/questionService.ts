import prisma from "@/lib/prisma";
import { Question } from "@prisma/client";

export interface CreateQuestionDTO {
  examId: string;
  questionText: string;
  questionType: "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER" | "CODING";
  marks: number;
  difficultyLevel: string;
  correctAnswer: Record<string, string | number | boolean>;
  options?: Record<string, string | number | boolean>;
  createdById: string;
  isAiGenerated?: boolean;
}

export interface UpdateQuestionDTO {
  questionText?: string;
  questionType?: "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER" | "CODING";
  marks?: number;
  difficultyLevel?: string;
  correctAnswer?: Record<string, string | number | boolean>;
  options?: Record<string, string | number | boolean>;
  isAiGenerated?: boolean;
}

export class QuestionService {
  async getAllQuestions(): Promise<Question[]> {
    return prisma.question.findMany({
      include: {
        exam: { select: { id: true, title: true, classSectionId: true } },
        createdBy: {
          select: {
            id: true,
            teacherCode: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createQuestion(data: CreateQuestionDTO): Promise<Question> {
    const {
      examId,
      questionText,
      questionType,
      marks,
      difficultyLevel,
      correctAnswer,
      options,
      createdById,
      isAiGenerated = false,
    } = data;

    if (
      !examId ||
      !questionText ||
      !questionType ||
      !marks ||
      !difficultyLevel ||
      !correctAnswer ||
      !createdById
    ) {
      throw new Error(
        "examId, questionText, questionType, marks, difficultyLevel, correctAnswer, and createdById are required"
      );
    }

    // Uncomment for Redis/BullMQ integration
    // return await questionQueue.add('create-question', { data });

    return prisma.question.create({
      data: {
        examId,
        questionText,
        questionType,
        marks,
        difficultyLevel,
        correctAnswer,
        options: options || undefined,
        createdById,
        isAiGenerated,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getQuestionById(id: string): Promise<Question | null> {
    if (!id) throw new Error("Question ID is required");

    return prisma.question.findUnique({
      where: { id },
      include: {
        exam: { select: { id: true, title: true, classSectionId: true } },
        createdBy: {
          select: {
            id: true,
            teacherCode: true,
            user: { select: { name: true } },
          },
        },
      },
    });
  }

  async updateQuestion(id: string, data: UpdateQuestionDTO): Promise<Question> {
    if (!id) throw new Error("Question ID is required");

    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    });
    if (!existingQuestion) throw new Error("Question not found");

    // Uncomment for Redis/BullMQ integration
    // return await questionQueue.add('update-question', { identity: id, data });

    return prisma.question.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteQuestion(id: string): Promise<void> {
    if (!id) throw new Error("Question ID is required");

    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    });
    if (!existingQuestion) throw new Error("Question not found");

    // Uncomment for Redis/BullMQ integration
    // await questionQueue.add('delete-question', { identity: id });

    await prisma.question.delete({ where: { id } });
  }
}
