import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const classSection = new Worker(
    'section-queue',
    async (job) => {
        switch(job.name){
            case "create-section":
        const result = await prisma.classSection.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`Batch ${job.data.name} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating department ${job.data.name}:`, err);
            return null;
        });
        if(result?.id){
            const redisKey = `classSection:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
        case "update-section":
            const update=await prisma.classSection.update({
                where: { id: job.data.identity },
                data: job.data.data   
            })
            if(update?.id){
                const redisKey = `classSection:${update.id}`;
                redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
            }
            return update;
        case "delete-section":
            const del=await prisma.classSection.delete({
                where:{id:job.data.identity}
            })
            if(del?.id){
                const redisKey = `classSection:${del.id}`;
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

classSection.on('completed', (job) => {
    console.log(`✅ classSection Job ${job.id} completed`);
}
);
classSection.on('failed', (job, err) => {
    console.error(`❌ classSection Job ${job?.id} failed:`, err);
}
);
classSection.on('progress', (job, progress) => {
    console.log(` classSection Job ${job.id} is ${progress}% complete`);
}
);
classSection.on('stalled', (job) => {
    console.log(`classSection Job ${job} has stalled`);
}
);
classSection.on('error', (error) => {
    console.error(`classSection Worker error: ${error}`);
}
);
classSection.on('paused', () => {
    console.log('classSection Worker paused');
}
);
classSection.on('resumed', () => {
    console.log('classSection Worker resumed');
}
);
classSection.on('drained', () => {
    console.log('classSection Worker drained');
}
);
(async () => {
    await classSection.waitUntilReady();
    console.log("classSection Worker is ready 🚀");
})();