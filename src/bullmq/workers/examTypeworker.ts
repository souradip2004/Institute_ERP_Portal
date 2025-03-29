import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const examhWorker = new Worker(
    'examtype-queue',
    async (job) => {
        switch(job.name){
            case "create-examtype":
        const result=await prisma.examType.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`examtype ${job.data.data} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating examtype ${job.data.data}:`, err);
            return null;
        });
        if(result?.id){
            const redisKey = `examtype:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
        case "update-examtype":
            const update=await prisma.examType.update({
                where: { id: job.data.identity },
                data: job.data.data   
            })
            if(update?.id){
                const redisKey = `examtype:${update.id}`;
                redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
            }
            return update;
        case "delete-course":
            const del=await prisma.examType.delete({
                where:{id:job.data.identity}
            })
            if(del?.id){
                const redisKey = `examtype:${del.id}`;
                redis.del(redisKey);
            }
            return del;
        default:
            throw new Error('Invalid job name');
        }
     },
    {
        connection: redis
    }
);

examhWorker.on('completed', (job) => {
    console.log(`✅ examtype Job ${job.id} completed`);
}
);
examhWorker.on('failed', (job, err) => {
    console.error(`❌ examtype Job ${job?.id} failed:`, err);
}
);
examhWorker.on('progress', (job, progress) => {
    console.log(` examtype Job ${job.id} is ${progress}% complete`);
}
);
examhWorker.on('stalled', (job) => {
    console.log(`examtype Job ${job} has stalled`);
}
);
examhWorker.on('error', (error) => {
    console.error(`examtype Worker error: ${error}`);
}
);
examhWorker.on('paused', () => {
    console.log('examtype Worker paused');
}
);
examhWorker.on('resumed', () => {
    console.log('examtype Worker resumed');
}
);
examhWorker.on('drained', () => {
    console.log('examtype Worker drained');
}
);
(async () => {
    await examhWorker.waitUntilReady();
    console.log("examtype Worker is ready 🚀");
})();