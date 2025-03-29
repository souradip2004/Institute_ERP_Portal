import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const classSectionQueue = new Queue('section-queue', {
  connection: redis
});