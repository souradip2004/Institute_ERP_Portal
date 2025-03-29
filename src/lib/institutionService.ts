import prisma from '@/lib/prisma';
import {InstitutionQueue} from '@/bullmq/queues/institutionqueue';
export async function getAllInstitutions() {
  return await prisma.institution.findMany();
}

export async function getInstitutionById(id: string) {
  return await prisma.institution.findUnique({ where: { id } });
}

export async function createInstitution(data: any) {
  return await prisma.institution.create({ data });
}

export async function updateInstitution(id: string, data: any) {
  return await prisma.institution.update({ where: { id }, data });
}

export async function deleteInstitution(id: string) {
  return await prisma.institution.delete({ where: { id } });
}