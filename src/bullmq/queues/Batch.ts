import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const batchQueue = new Queue('batch-queue', {
    connection: redis
    });