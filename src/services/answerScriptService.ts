import prisma from '@/config/prisma';

export class AnswerScriptService {
  async getAll() {
    return prisma.answerScript.findMany({
      include: {
        examSubmission: true,
        question: true,
        gradedBy: true
      }
    });
  }

  async create(data: any) {
    return prisma.answerScript.create({
      data: {
        examSubmissionId: data.examSubmissionId,
        questionId: data.questionId,
        studentAnswer: data.studentAnswer,
        obtainedMarks: data.obtainedMarks || 0,
        remarks: data.remarks,
        status: data.status,
        gradedById: data.gradedById,
        gradedAt: data.gradedAt ? new Date(data.gradedAt) : null,
        isAiGraded: data.isAiGraded || false,
        aiFeedback: data.aiFeedback
      }
    });
  }

  async getById(id: string) {
    return prisma.answerScript.findUnique({ 
      where: { id },
      include: {
        examSubmission: true,
        question: true,
        gradedBy: true
      }
    });
  }

  async update(id: string, data: any) {
    return prisma.answerScript.update({
      where: { id },
      data: {
        studentAnswer: data.studentAnswer,
        obtainedMarks: data.obtainedMarks,
        remarks: data.remarks,
        status: data.status,
        gradedById: data.gradedById,
        gradedAt: data.gradedAt ? new Date(data.gradedAt) : undefined,
        isAiGraded: data.isAiGraded,
        aiFeedback: data.aiFeedback
      }
    });
  }

  async delete(id: string) {
    return prisma.answerScript.delete({
      where: { id }
    });
  }
}