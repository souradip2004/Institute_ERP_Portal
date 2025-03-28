import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const emailQueue = new Queue('signup-queue', {
  connection: redis
});
