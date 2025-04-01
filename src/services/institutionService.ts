import prisma from '@/config/prisma';
import { InstitutionQueue } from '@/bullmq/queues/institutionqueue';
export class InstitutionService {
  async getAllInstitutions() {
    console.log('Fetching all institutions');
    return prisma.institution.findMany();
  }

  async createInstitution(data: any) {
    console.log('Creating institution:', data);
    // return InstitutionQueue.add('create-institution', {
    //   data,
    // });;

    return await prisma.institution.create({
      data: data,
    });
  }

  async getInstitutionById(id: string) {
    return prisma.institution.findUnique({ where: { id } });
  }

  async updateInstitution(id: string, data: any) {
    return  InstitutionQueue.add('update-institution', {
      data,
      identity:id
    });
  }

  async deleteInstitution(id: string) {
    return  InstitutionQueue.add('delete-institution', {
      identity:id,
    });
  }
}
