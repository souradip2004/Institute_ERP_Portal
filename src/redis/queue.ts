import { Queue } from 'bullmq';

export const myQueue = new Queue('my-queue', {
  connection: {
    host: 'abv-d047hd.serverless.apse2.cache.amazonaws.com:6379', // Valkey host
    port: 6379,
    password: '', 
  },
});
