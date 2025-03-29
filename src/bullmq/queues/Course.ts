import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const courseQueue = new Queue('course-queue', {
    connection: redis
    });