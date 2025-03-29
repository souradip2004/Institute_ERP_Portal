import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const DepartmentQueue = new Queue('department-queue', {
  connection: redis
});