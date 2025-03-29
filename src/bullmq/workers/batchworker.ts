import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const batchWorker = new Worker(
    'batch-queue',

    async (job) => {
        switch(job.name){
            case "create-batch":
        const result = await prisma.batch.create({
            data: job.data.data,
        }).then((batch) => {
            console.log(`Batch ${job.data.name} created`);
            return batch;
        }).catch((err) => {
            console.error(`Error creating batch ${job.data.name}:`, err);
            return null;
        });
        if(result?.id){
            const redisKey = `batch:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
        case "update-batch":
           const update= await prisma.batch.update({
                where: { id: job.data.identity },
                data: job.data.data            })
            if(update?.id){
                const redisKey = `batch:${update.id}`;
                redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
            }
            return update;
        case "delete-batch":
         const del=await prisma.batch.delete({
                where:{id:job.data.identity}
            })
            if(del?.id){
                const redisKey = `batch:${del.id}`;
                redis.del(redisKey);
            }
            return del;
        default :
        throw new Error('Invalid job name');

            }

},

    {
        connection: redis
    }
);

batchWorker.on('completed', (job) => {
    console.log(`✅ Batch Job ${job.id} completed`);
}
);
batchWorker.on('failed', (job, err) => {
    console.error(`❌ Batch Job ${job?.id} failed:`, err);
}
);
batchWorker.on('progress', (job, progress) => {
    console.log(` Batch Job ${job.id} is ${progress}% complete`);
}
);
batchWorker.on('stalled', (job) => {
    console.log(`Batch Job ${job} has stalled`);
}
);
batchWorker.on('error', (error) => {
    console.error(`Batch Worker error: ${error}`);
}
);
batchWorker.on('paused', () => {
    console.log('Batch Worker paused');
}
);
batchWorker.on('resumed', () => {
    console.log('Batch Worker resumed');
}
);
batchWorker.on('drained', () => {
    console.log('Batch Worker drained');
}
);
(async () => {
    await batchWorker.waitUntilReady();
    console.log("batch Worker is ready 🚀");
})();