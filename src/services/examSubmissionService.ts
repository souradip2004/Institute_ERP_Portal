import prisma from "@/lib/prisma";

export class ExamSubmissionService {
  async getAll() {
    return prisma.examSubmission.findMany({
      include: {
        exam: true,
        student: true,
        gradedBy: true,
      },
    });
  }

  async create(data: any) {
    return prisma.examSubmission.create({
      data: {
        examId: data.examId,
        studentId: data.studentId,
        submissionTime: new Date(),
        obtainedMarks: data.obtainedMarks || 0,
        status: data.status,
        feedback: data.feedback,
        gradedById: data.gradedById,
        gradedAt: data.gradedAt ? new Date(data.gradedAt) : null,
      },
    });
  }

  async getById(id: string) {
    return prisma.examSubmission.findUnique({
      where: { id },
      include: {
        exam: true,
        student: true,
        gradedBy: true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.examSubmission.update({
      where: { id },
      data: {
        obtainedMarks: data.obtainedMarks,
        status: data.status,
        feedback: data.feedback,
        gradedById: data.gradedById,
        gradedAt: data.gradedAt ? new Date(data.gradedAt) : undefined,
      },
    });
  }

  async delete(id: string) {
    return prisma.examSubmission.delete({
      where: { id },
    });
  }
}
