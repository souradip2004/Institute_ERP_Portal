import prisma from '@/config/prisma';

export class UserService {
  async getAllUsers() {
    return prisma.user.findMany();
  }

  async createUser(data: any) {
    return prisma.user.create({ data });
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id: string, data: any) {
    return prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
