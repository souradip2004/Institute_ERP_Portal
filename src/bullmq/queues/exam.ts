import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const examQueue = new Queue('exam-queue', {
    connection: redis
    });