import prisma from "@/lib/prisma";
import { examQueue } from "@/bullmq/queues/exam";

export class ExamService {
  // Re-define the method as a non-async function first to check if it's a declaration issue
  getExamsByClassSection(classSectionId: string, studentId: string) {
    return this.getExamsByClassSectionImpl(classSectionId, studentId);
  }

  // Implement the actual logic in a separate method to avoid naming collisions
  private async getExamsByClassSectionImpl(
    classSectionId: string,
    studentId: string
  ) {
    // Get all exams for this class section
    const exams = await prisma.exam.findMany({
      where: {
        classSectionId: classSectionId,
        isPublished: true, // Only get published exams
      },
      include: {
        examType: {
          select: {
            name: true,
          },
        },
        classSection: {
          select: {
            id: true,
            batch: {
              select: {
                batchName: true,
              },
            },
            semester: {
              select: {
                name: true,
              },
            },
            // Fetch course information through teacher course section relation
            teacherCourseSectionRelations: {
              select: {
                course: {
                  select: {
                    name: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
        // Get student's submissions if any
        examSubmissions: {
          where: {
            studentId: studentId,
          },
          select: {
            id: true,
            obtainedMarks: true,
            status: true,
            submissionTime: true,
          },
        },
        // Include limited question data
        questions: {
          select: {
            id: true,
            questionType: true,
            marks: true,
          },
        },
      },
      orderBy: {
        examDate: "desc",
      },
    });

    // Process the exams to add derived fields and format for frontend
    return exams.map((exam: any) => {
      // Calculate total marks from the questions
      const totalMarks = exam.questions.reduce(
        (sum: number, q: any) => sum + q.marks,
        0
      );

      // Check if student has submitted this exam
      const submission =
        exam.examSubmissions && exam.examSubmissions.length > 0
          ? exam.examSubmissions[0]
          : null;

      // Get course name from the relation if it exists
      const courseName =
        exam.classSection.teacherCourseSectionRelations &&
        exam.classSection.teacherCourseSectionRelations.length > 0
          ? exam.classSection.teacherCourseSectionRelations[0].course.name
          : null;

      // Get batchName from batch
      const batchName = exam.classSection.batch
        ? exam.classSection.batch.batchName
        : null;

      return {
        id: exam.id,
        title: exam.title,
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks || totalMarks,
        passingMarks: exam.passingMarks,
        // Add status based on dates and submission
        status: this.determineExamStatus(exam, submission),
        // Add score if the exam is completed
        score: submission?.obtainedMarks || null,
        examType: exam.examType,
        subject: courseName || (exam.examType ? exam.examType.name : "Unknown"),
        classSection: {
          id: exam.classSection.id,
          batch: {
            name: batchName,
          },
          semester: exam.classSection.semester,
          course: courseName ? { name: courseName } : null,
        },
        questionCount: exam.questions.length,
      };
    });
  }

  async getAllExams() {
    return prisma.exam.findMany();
  }

  // Helper function to determine exam status
  private determineExamStatus(exam: any, submission: any) {
    const now = new Date();
    const examDate = new Date(exam.examDate);
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    // Combine date and time for comparison
    const examStartDateTime = new Date(
      examDate.getFullYear(),
      examDate.getMonth(),
      examDate.getDate(),
      startTime.getHours(),
      startTime.getMinutes()
    );

    const examEndDateTime = new Date(
      examDate.getFullYear(),
      examDate.getMonth(),
      examDate.getDate(),
      endTime.getHours(),
      endTime.getMinutes()
    );

    // If student has submitted
    if (submission) {
      if (submission.status === "GRADED") {
        return "GRADED";
      }
      return "COMPLETED";
    }

    // Determine status based on time
    if (now < examStartDateTime) {
      return "UPCOMING";
    } else if (now >= examStartDateTime && now <= examEndDateTime) {
      return "ONGOING";
    } else {
      return "CLOSED";
    }
  }

  async createExam(data: any) {
    // Convert the date string and time string into DateTime objects
    const examDate = new Date(data.examDate);
    const startTime = new Date(`1970-01-01T${data.startTime}Z`); // Use a dummy date and provide time
    const endTime = new Date(`1970-01-01T${data.endTime}Z`); // Same for end time

    const formattedData = {
      ...data,
      examDate: examDate.toISOString(), // Keep the examDate in ISO format
      startTime: startTime.toISOString(), // Convert time to DateTime (ISO 8601 format)
      endTime: endTime.toISOString(), // Convert time to DateTime (ISO 8601 format)
    };

    return await prisma.exam.create({ data: formattedData });
  }

  async getExamById(id: string) {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            marks: true,
            options: true,
          },
        },
        examType: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async updateExam(id: string, data: any) {
    return await examQueue.add("update-exam", {
      identity: id,
      data,
    });
  }

  async deleteExam(id: string) {
    return prisma.exam.delete({ where: { id } });
  }
}
