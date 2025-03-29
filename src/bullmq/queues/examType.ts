import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const examtypeQueue = new Queue('examtype-queue', {
    connection: redis
    });