import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const studentQueue = new Queue('student-queue', {
  connection: redis
});