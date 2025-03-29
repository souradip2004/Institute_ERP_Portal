import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const DheadQueue = new Queue('dhead-queue', {
  connection: redis
});