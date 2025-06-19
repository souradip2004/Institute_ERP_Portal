import Redis from 'ioredis';


export const redis = new Redis('103.180.212.159:7006', {
    password: '1234'
});


redis.on('connect', () => console.log('Redis connected ✅'));
redis.on('error', (err) => console.error('Redis error ❌', err));
