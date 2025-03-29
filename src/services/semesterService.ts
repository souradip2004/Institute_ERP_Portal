import prisma from '@/lib/prisma';
import {semesterQueue} from '@/bullmq/queues/Semester';
export class SemesterService {
  async getAllSemesters() {
    return await prisma.semester.findMany();
  }
  async createSemester(data: any) {
    return await semesterQueue.add('create-semester',{
     data
    })
  }

  async updateSemester(id: string, data: any) {
   return await semesterQueue.add('update-semester',{
    data,
    identity:id
   })
  }



  async getSemesterById(id: string) {
    return await prisma.semester.findUnique({ where: { id } });
  }

 
  async deleteSemester(id: string) {
    return await semesterQueue.add('delete-semester',{
      identity:id
     })
  }
}
