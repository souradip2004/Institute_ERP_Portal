import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const examSubmitQueue = new Queue('examSubmit-queue', {
  connection: redis
});