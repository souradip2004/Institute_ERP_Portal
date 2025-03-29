import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const enrollQueue = new Queue('enroll-queue', {
  connection: redis
});