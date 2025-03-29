import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const enrollWorker = new Worker(
    'enroll-queue',
    async (job) => {
        switch (job.name){
            case "create-enroll":
        const result = await prisma.studentClassEnrollment.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`enroll ${job.data.data} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating enroll ${job.data}:`, err);
            return null
        });
        if(result?.id){
            const redisKey = `enroll:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
    case "update-enroll":
       const update= await prisma.studentClassEnrollment.update({
where: { id: job.data.identity },
data: job.data.data,
        }
            
        )
        if(update?.id){
            const redisKey = `enroll:${update.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
        }
        return update;
        
    case "delete-enroll":
        const del=await prisma.studentClassEnrollment.delete({
            where:{id:job.data.identity}
        })
        if(del?.id){
            const redisKey = `enroll:${del.id}`;
            redis.del(redisKey);
        }
        return del;
    default:
        throw new Error('Invalid job name');
    }},
    {
        connection: redis
    }
);

enrollWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
}
);
enrollWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
}
);
enrollWorker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} is ${progress}% complete`);
}
);
enrollWorker.on('stalled', (job) => {
    console.log(`Job ${job} has stalled`);
}
);
enrollWorker.on('error', (error) => {
    console.error(`Worker error: ${error}`);
}
);
enrollWorker.on('paused', () => {
    console.log('Worker paused');
}
);
enrollWorker.on('resumed', () => {
    console.log('Worker resumed');
}
);
enrollWorker.on('drained', () => {
    console.log('Worker drained');
}
);
(async () => {
    await enrollWorker.waitUntilReady();
    console.log("enroll Worker is ready 🚀");
})();