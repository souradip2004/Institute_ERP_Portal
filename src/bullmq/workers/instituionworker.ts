import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';

const institutionWorker = new Worker('institution-queue', async (job) => {
    switch (job.name) {
        case 'create-institution':
        const result=await prisma.institution.create({
            data: job.data.data,
        });
        console.log(`Institution ${job.data.data} created`);
        return result;  
        case 'update-institution':
        return await prisma.institution.update({
            where: { id: job.data.identity },
            data: job.data.data,
        });
        case 'delete-institution':
        return await prisma.institution.delete({
            where: { id: job.data.identity },
        });
        default:
        throw new Error('Invalid job name');
    }
    }, {
    connection: redis,
    concurrency: 5,
    limiter: {
        max: 100,
        duration: 1000,
    },
    lockDuration: 10000,
    stalledInterval: 10000,
    maxStalledCount: 1,
    lockRenewTime: 5000,
    autorun: true,
    removeOnComplete: { age: 3600 }, 
    removeOnFail: { age: 3600 }, 
})
institutionWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
});
institutionWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
}
);
(async () => {
    await institutionWorker.waitUntilReady();
    console.log("Institution Worker is ready 🚀");
})();