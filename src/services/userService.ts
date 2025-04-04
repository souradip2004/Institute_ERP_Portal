import prisma from "@/config/prisma";
import { userQueue } from "@/bullmq/queues/userqueue";
import bcrypt from "bcryptjs";

export class UserService {
  async getAll() {
    return prisma.user.findMany();
  }

  async create(data: any) {
    const { password, ...otherData } = data;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with hashed password
    return prisma.user.create({
      data: {
        ...otherData,
        password: hashedPassword,
      },
    });
  }

  async getById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data: {
        ...data}
    });
    return userQueue.add("update-user", {
      data,
      identity: id,
    });
  }

  async delete(id: string) {
    return userQueue.add("delete-user", {
      identity: id,
    });
  }
}
