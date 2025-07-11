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
    console.log("Incoming answers:", data.answers);

    // Use .map() to correctly transform the array of answers
    const answerScripts = data.answers.map((answer: any) => ({
      questionId: answer.questionId, // Correctly access the questionId from each object
      studentAnswer: answer.studentAnswer,
      answerImgURL: answer.answerImgURL,
      status: data.status, // You can also use answer.status if it's part of the answer object
    }));

    console.log("Corrected Answer Scripts: ", answerScripts);

    return prisma.examSubmission.create({
      data: {
        examId: data.examId,
        studentId: data.studentId,
        submissionTime: new Date(),
        status: data.status,
        answerScripts: {
          create: answerScripts,
        },
      },
    });
  }

  async getById(id: string) {
    return prisma.examSubmission.findUnique({
      where: {id},
      include: {
        exam: true,
        student: true,
        gradedBy: true,
      },
    });
  }

  async getByStudentId(id: string) {
    console.log(id)
    return prisma.examSubmission.findMany({
      where: {studentId: id},
      include: {
        exam: true,
        student: true,
        gradedBy: true,
      },
      orderBy: {
        submissionTime: 'desc'
      }
    })
  }

  async update(id: string, data: any) {
    return prisma.examSubmission.update({
      where: {id},
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
      where: {id},
    });
  }
}
