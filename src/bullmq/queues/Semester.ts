import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const semesterQueue = new Queue('semester-queue', {
    connection: redis
    });