import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const examSubmitWorker = new Worker(
    'examSubmit-queue',
    async (job) => {
        switch (job.name){
            case "create-examSubmit":
        const result = await prisma.examSubmission.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`examSubmit ${job.data.data} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating examSubmit ${job.data}:`, err);
            return null
        });
        if(result?.id){
            const redisKey = `examSubmit:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
    case "update-examSubmit":
       const update= await prisma.examSubmission.update({
where: { id: job.data.identity },
data: job.data.data,
        }
            
        )
        if(update?.id){
            const redisKey = `examSubmit:${update.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
        }
        return update;
        
    case "delete-examSubmit":
        const del=await prisma.examSubmission.delete({
            where:{id:job.data.identity}
        })
        if(del?.id){
            const redisKey = `examSubmit:${del.id}`;
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

examSubmitWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
}
);
examSubmitWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
}
);
examSubmitWorker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} is ${progress}% complete`);
}
);
examSubmitWorker.on('stalled', (job) => {
    console.log(`Job ${job} has stalled`);
}
);
examSubmitWorker.on('error', (error) => {
    console.error(`Worker error: ${error}`);
}
);
examSubmitWorker.on('paused', () => {
    console.log('Worker paused');
}
);
examSubmitWorker.on('resumed', () => {
    console.log('Worker resumed');
}
);
examSubmitWorker.on('drained', () => {
    console.log('Worker drained');
}
);
(async () => {
    await examSubmitWorker.waitUntilReady();
    console.log("examSubmit Worker is ready 🚀");
})();