import { Queue } from 'bullmq';
import { redis } from '@/redis/redis';

export const ascriptQueue = new Queue('ascript-queue', {
    connection: redis
    });