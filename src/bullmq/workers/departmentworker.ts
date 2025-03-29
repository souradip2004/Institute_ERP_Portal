import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const departmentWorker = new Worker(
    'department-queue',
    async (job) => {
        switch (job.name){
            case "create-department":
        const result = await prisma.department.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`Department ${job.data.data} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating department ${job.data}:`, err);
            return null
        });
        if(result?.id){
            const redisKey = `department:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
    case "update-department":
       const update= await prisma.department.update({
where: { id: job.data.identity },
data: job.data.data,
        }
            
        )
        if(update?.id){
            const redisKey = `department:${update.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
        }
        return update;
        
    case "delete-department":
        const del=await prisma.department.delete({
            where:{id:job.data.identity}
        })
        if(del?.id){
            const redisKey = `department:${del.id}`;
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

departmentWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
}
);
departmentWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
}
);
departmentWorker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} is ${progress}% complete`);
}
);
departmentWorker.on('stalled', (job) => {
    console.log(`Job ${job} has stalled`);
}
);
departmentWorker.on('error', (error) => {
    console.error(`Worker error: ${error}`);
}
);
departmentWorker.on('paused', () => {
    console.log('Worker paused');
}
);
departmentWorker.on('resumed', () => {
    console.log('Worker resumed');
}
);
departmentWorker.on('drained', () => {
    console.log('Worker drained');
}
);
(async () => {
    await departmentWorker.waitUntilReady();
    console.log("department Worker is ready 🚀");
})();