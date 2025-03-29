import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const dheadWorker = new Worker(
    'dhead-queue',
    async (job) => {
        switch (job.name){
            case "create-dhead":
        const result = await prisma.departmentHead.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`Department Head ${job.data.data} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating department Head ${job.data}:`, err);
            return null
        });
        if(result?.id){
            const redisKey = `dhead:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
    case "update-dhead":
       const update= await prisma.departmentHead.update({
where: { id: job.data.identity },
data: job.data.data,
        }
            
        )
        if(update?.id){
            const redisKey = `dhead:${update.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
        }
        return update;
        
    case "delete-dhead":
        const del=await prisma.departmentHead.delete({
            where:{id:job.data.identity}
        })
        if(del?.id){
            const redisKey = `dhead:${del.id}`;
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

dheadWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
}
);
dheadWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
}
);
dheadWorker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} is ${progress}% complete`);
}
);
dheadWorker.on('stalled', (job) => {
    console.log(`Job ${job} has stalled`);
}
);
dheadWorker.on('error', (error) => {
    console.error(`Worker error: ${error}`);
}
);
dheadWorker.on('paused', () => {
    console.log('Worker paused');
}
);
dheadWorker.on('resumed', () => {
    console.log('Worker resumed');
}
);
dheadWorker.on('drained', () => {
    console.log('Worker drained');
}
);
(async () => {
    await dheadWorker.waitUntilReady();
    console.log("department Head Worker is ready 🚀");
})();