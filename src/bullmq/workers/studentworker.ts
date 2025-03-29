import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const studentWorker = new Worker(
    'student-queue',
    async (job) => {
        switch (job.name){
            case "create-student":
        const result = await prisma.student.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`student ${job.data.data} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating student ${job.data}:`, err);
            return null
        });
        if(result?.id){
            const redisKey = `student:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
    case "update-student":
       const update= await prisma.student.update({
where: { id: job.data.identity },
data: job.data.data,
        }
            
        )
        if(update?.id){
            const redisKey = `student:${update.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
        }
        return update;
        
    case "delete-student":
        const del=await prisma.student.delete({
            where:{id:job.data.identity}
        })
        if(del?.id){
            const redisKey = `student:${del.id}`;
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

studentWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
}
);
studentWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
}
);
studentWorker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} is ${progress}% complete`);
}
);
studentWorker.on('stalled', (job) => {
    console.log(`Job ${job} has stalled`);
}
);
studentWorker.on('error', (error) => {
    console.error(`Worker error: ${error}`);
}
);
studentWorker.on('paused', () => {
    console.log('Worker paused');
}
);
studentWorker.on('resumed', () => {
    console.log('Worker resumed');
}
);
studentWorker.on('drained', () => {
    console.log('Worker drained');
}
);
(async () => {
    await studentWorker.waitUntilReady();
    console.log("student Worker is ready 🚀");
})();