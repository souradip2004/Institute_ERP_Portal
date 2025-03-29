import prisma from '@/lib/prisma';

export class SemesterService {
  async getAllSemesters() {
    return await prisma.semester.findMany();
  }
  async createSemester(data: any) {
    return await prisma.semester.create({
      data: {
        name: data.name,
        startDate: new Date(data.start_date), // Convert to Date object
        endDate: new Date(data.end_date), // Convert to Date object
        institutionId: data.institution_id,
        isCurrent: data.is_current,
      },
    });
  }

  async updateSemester(id: string, data: any) {
    return await prisma.semester.update({
      where: { id },
      data: {
        name: data.name,
        ...(data.start_date && { startDate: new Date(data.start_date) }),
        ...(data.end_date && { endDate: new Date(data.end_date) }),
        ...(data.institution_id && { institutionId: data.institution_id }),
        ...(data.is_current !== undefined && { isCurrent: data.is_current }),
      },
    });
  }



  async getSemesterById(id: string) {
    return await prisma.semester.findUnique({ where: { id } });
  }

 
  async deleteSemester(id: string) {
    return await prisma.semester.delete({ where: { id } });
  }
}
