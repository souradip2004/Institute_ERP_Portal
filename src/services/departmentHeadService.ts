import prisma from "@/config/prisma";
import { DheadQueue } from "@/bullmq/queues/departmentHead";
export class DepartmentHeadService {
  async getAll() {
    return prisma.departmentHead.findMany();
  }

  async create(data: any) {
    const formattedData = {
      ...data,
      appointmentDate: new Date(data.appointmentDate).toISOString(),
    };

    return await prisma.departmentHead.create({
      data: formattedData,
    });
  }

  async getById(id: string) {
    return prisma.departmentHead.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.departmentHead.update({
      where: { id },
      data,
    });
    // return DheadQueue.add('update-dhead', {
    //   identity: id,
    //   data,
    // });
  }

  async delete(id: string) {
    return prisma.departmentHead.delete({where:{id}});
    // return DheadQueue.add("delete-dhead", {
    //   identity: id,
    // });
  }
}
