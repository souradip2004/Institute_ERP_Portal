import prisma from '@/config/prisma';
import {userQueue} from '@/bullmq/queues/userqueue';
export class UserService {
  async getAllUsers() {
    return prisma.user.findMany();
  }

  async createUser(data: any) {
    // return userQueue.add('create-user', {
    //   data});

    return prisma.user.create({ data });
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id: string, data: any) {
    return userQueue.add('update-user', {
      data,
      identity:id});
  }

  async deleteUser(id: string) {
    return userQueue.add('delete-user', {
      identity:id});
  }
}
