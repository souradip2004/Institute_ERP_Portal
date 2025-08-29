import Redis from 'ioredis';


/*
export const redis = new Redis('103.180.212.159:7006', {
    password: '1234'
});
*/

export const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});



redis.on('connect', () => console.log('Redis connected ✅'));
redis.on('error', (err) => console.error('Redis error ❌', err));
