import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const userQueue = new Queue('user-queue', {
    connection: redis
    });