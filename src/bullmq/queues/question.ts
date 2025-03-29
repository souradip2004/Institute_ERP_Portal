import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const questionQueue = new Queue('question-queue', {
  connection: redis
});