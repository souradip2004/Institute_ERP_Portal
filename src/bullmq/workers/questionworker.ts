import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const questionWorker = new Worker(
    'question-queue',
    async (job) => {
        switch (job.name){
            case "create-question":
        const result = await prisma.question.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`question ${job.data.data} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating question ${job.data}:`, err);
            return null
        });
        if(result?.id){
            const redisKey = `question:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
    case "update-question":
       const update= await prisma.question.update({
where: { id: job.data.identity },
data: job.data.data,
        }
            
        )
        if(update?.id){
            const redisKey = `question:${update.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
        }
        return update;
        
    case "delete-question":
        const del=await prisma.question.delete({
            where:{id:job.data.identity}
        })
        if(del?.id){
            const redisKey = `question:${del.id}`;
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

questionWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
}
);
questionWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
}
);
questionWorker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} is ${progress}% complete`);
}
);
questionWorker.on('stalled', (job) => {
    console.log(`Job ${job} has stalled`);
}
);
questionWorker.on('error', (error) => {
    console.error(`Worker error: ${error}`);
}
);
questionWorker.on('paused', () => {
    console.log('Worker paused');
}
);
questionWorker.on('resumed', () => {
    console.log('Worker resumed');
}
);
questionWorker.on('drained', () => {
    console.log('Worker drained');
}
);
(async () => {
    await questionWorker.waitUntilReady();
    console.log("question Worker is ready 🚀");
})();