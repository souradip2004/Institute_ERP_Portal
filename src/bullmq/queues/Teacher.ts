import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const teacherQueue = new Queue('teacher-queue', {
    connection: redis
    });