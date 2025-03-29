import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const userQueue = new Queue('batch-queue', {
    connection: redis
    });