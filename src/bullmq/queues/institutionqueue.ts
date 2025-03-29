import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const InstitutionQueue = new Queue('institution-queue', {
  connection: redis
});
