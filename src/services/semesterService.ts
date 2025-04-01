import prisma from '@/lib/prisma';
import {semesterQueue} from '@/bullmq/queues/Semester';
export class SemesterService {
  async getAllSemesters() {
    return await prisma.semester.findMany();
  }
  async createSemester(data: any) {
    // return await semesterQueue.add('create-semester',{
    //  data
    // })

     const semesterData = {
    name: data.name || "Fall 2022",
    startDate: data.startDate ? new Date(data.startDate) : new Date('2022-09-01'),
    endDate: data.endDate ? new Date(data.endDate) : new Date('2022-12-31'),
    institutionId: data.institutionId,
    isCurrent: data.isCurrent,
  };
   return await prisma.semester.create({
      data: semesterData,
    });
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
