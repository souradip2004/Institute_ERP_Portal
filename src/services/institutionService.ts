import prisma from "@/lib/prisma";
import { InstitutionQueue } from "@/bullmq/queues/institutionqueue";
import fs from "fs";
export class InstitutionService {
  async getAllInstitutions() {
    console.log("Fetching all institutions");
    return prisma.institution.findMany();
  }

  async createInstitution(data: any) {
    console.log("Creating institution:", data);
    fs.writeFileSync("institution.json", JSON.stringify(data, null, 2));
    // return InstitutionQueue.add('create-institution', {
    //   data,
    // });;
    const {userId,...rest} = data;
    return await prisma.institution.create({
      data: rest,
    });
  }

  async getInstitutionById(id: string) {
    return prisma.institution.findUnique({ where: { id } });
  }

  async updateInstitution(id: string, data: any) {
    // return  InstitutionQueue.add('update-institution', {
    //   data,
    //   identity:id
    // });

    return await prisma.institution.update({ where: { id }, data });
  }

  async deleteInstitution(id: string) {
    return prisma.institution.delete({ where: { id } });
    return InstitutionQueue.add("delete-institution", {
      identity: id,
    });
  }

  async getAllDepartmentsByInstitute(institutionId: string) {
    return await prisma.department.findMany({
      where: { institutionId },
    });
  }

  async getAllSemestersByinstituteId(institutionId: string) {
    return await prisma.semester.findMany({
      where: { institutionId },
    });
  }
}
