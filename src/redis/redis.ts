import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is not defined');
}

export const redis = new Redis('redis://localhost:6379');


redis.on('connect', () => console.log('Redis connected ✅'));
redis.on('error', (err) => console.error('Redis error ❌', err));
