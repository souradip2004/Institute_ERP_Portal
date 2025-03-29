import prisma from '@/config/prisma';

export class InstitutionService {
  async getAllInstitutions() {
    console.log('Fetching all institutions');
    return prisma.institution.findMany();
  }

  async createInstitution(data: any) {
    return prisma.institution.create({ data });
  }

  async getInstitutionById(id: string) {
    return prisma.institution.findUnique({ where: { id } });
  }

  async updateInstitution(id: string, data: any) {
    return prisma.institution.update({ where: { id }, data });
  }

  async deleteInstitution(id: string) {
    return prisma.institution.delete({ where: { id } });
  }
}
