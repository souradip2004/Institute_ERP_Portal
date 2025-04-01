import prisma from '@/config/prisma';
import {userQueue} from '@/bullmq/queues/userqueue';
export class UserService {
  async getAllUsers() {
    return prisma.user.findMany();
  }
async createUser(data: any) {
  // Parse and format dates properly to ensure the correct format
  const formattedData = {
    ...data,
    emailVerified: data.emailVerified ? new Date(data.emailVerified).toISOString() : null,
    dateOfBirth: new Date(data.dateOfBirth).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return prisma.user.create({ data: formattedData });
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
