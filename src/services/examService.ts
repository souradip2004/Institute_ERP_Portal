import prisma from '@/config/prisma';
import { examQueue } from '@/bullmq/queues/exam';
export class ExamService {
  async getAllExams() {
    return prisma.exam.findMany();
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
    return prisma.exam.findUnique({ where: { id } });
  }

  async updateExam(id: string, data: any) {
    return await examQueue.add('update-exam',{
      identity:id,
      data
    });
  }

  async deleteExam(id: string) {
    return prisma.exam.delete({ where: { id } });
  }

  
}


