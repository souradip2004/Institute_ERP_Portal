import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const semesterhWorker = new Worker(
    'semester-queue',
    async (job) => {
        switch(job.name){
            case "create-semester":
       const result= await prisma.semester.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`Batch ${job.data.data} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating department ${job.data.data}:`, err);
            return null;
        });
        if(result?.id){
            const redisKey = `semester:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
        case "update-semester":
            const update=await prisma.semester.update({
                where: { id: job.data.identity },
                data: job.data.data   
            })
            if(update?.id){
                const redisKey = `semester:${update.id}`;
                redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
            }
            return update;
        case "delete-semester":
            const del=await prisma.semester.delete({
                where:{id:job.data.identity}
            })
            if(del?.id){
                const redisKey = `semester:${del.id}`;
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

semesterhWorker.on('completed', (job) => {
    console.log(`✅ Semester Job ${job.id} completed`);
}
);
semesterhWorker.on('failed', (job, err) => {
    console.error(`❌ Semester Job ${job?.id} failed:`, err);
}
);
semesterhWorker.on('progress', (job, progress) => {
    console.log(` Semester Job ${job.id} is ${progress}% complete`);
}
);
semesterhWorker.on('stalled', (job) => {
    console.log(`Semester Job ${job} has stalled`);
}
);
semesterhWorker.on('error', (error) => {
    console.error(`Semester Worker error: ${error}`);
}
);
semesterhWorker.on('paused', () => {
    console.log('Semester Worker paused');
}
);
semesterhWorker.on('resumed', () => {
    console.log('Semester Worker resumed');
}
);
semesterhWorker.on('drained', () => {
    console.log('Semester Worker drained');
}
);
(async () => {
    await semesterhWorker.waitUntilReady();
    console.log("Semester Worker is ready 🚀");
})();