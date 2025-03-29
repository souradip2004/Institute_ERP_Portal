import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const ascriptWorker = new Worker(
    'ascript-queue',
    async (job) => {
        switch (job.name){
            case "create-ascript":
        const result = await prisma.answerScript.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`ascript ${job.data.data} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating ascript ${job.data}:`, err);
            return null
        });
        if(result?.id){
            const redisKey = `ascript:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
    case "update-ascript":
       const update= await prisma.answerScript.update({
where: { id: job.data.identity },
data: job.data.data,
        }
            
        )
        if(update?.id){
            const redisKey = `ascript:${update.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
        }
        return update;
        
    case "delete-ascript":
        const del=await prisma.answerScript.delete({
            where:{id:job.data.identity}
        })
        if(del?.id){
            const redisKey = `ascript:${del.id}`;
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

ascriptWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
}
);
ascriptWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
}
);
ascriptWorker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} is ${progress}% complete`);
}
);
ascriptWorker.on('stalled', (job) => {
    console.log(`Job ${job} has stalled`);
}
);
ascriptWorker.on('error', (error) => {
    console.error(`Worker error: ${error}`);
}
);
ascriptWorker.on('paused', () => {
    console.log('Worker paused');
}
);
ascriptWorker.on('resumed', () => {
    console.log('Worker resumed');
}
);
ascriptWorker.on('drained', () => {
    console.log('Worker drained');
}
);
(async () => {
    await ascriptWorker.waitUntilReady();
    console.log("department Head Worker is ready 🚀");
})();