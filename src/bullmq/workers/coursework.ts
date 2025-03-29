import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const courseWorker = new Worker(
    'course-queue',
    async (job) => {
        switch(job.name){
        case "create-course":
        const result=await prisma.course.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`Batch ${job.data.data} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating Course ${job.name}:`, err);
            return null;
        });
        return result;
        case "update-course":
          const update=  await prisma.course.update({
                where: { id: job.data.identity },
                data: job.data.data 
            })
            if(update?.id){
                const redisKey = `course:${update.id}`;
                redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
            }
            return update;
        case "delete-course":
            const del=await prisma.batch.delete({
                where:{id:job.data.identity}
            })
            if(del?.id){
                const redisKey = `course:${del.id}`;
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

courseWorker.on('completed', (job) => {
    console.log(`✅ Course Job ${job.id} completed`);
}
);
courseWorker.on('failed', (job, err) => {
    console.error(`❌ Course Job ${job?.id} failed:`, err);
}
);
courseWorker.on('progress', (job, progress) => {
    console.log(` Course Job ${job.id} is ${progress}% complete`);
}
);
courseWorker.on('stalled', (job) => {
    console.log(`Course Job ${job} has stalled`);
}
);
courseWorker.on('error', (error) => {
    console.error(`Course Worker error: ${error}`);
}
);
courseWorker.on('paused', () => {
    console.log('Course Worker paused');
}
);
courseWorker.on('resumed', () => {
    console.log('Course Worker resumed');
}
);
courseWorker.on('drained', () => {
    console.log('Course Worker drained');
}
);
(async () => {
    await courseWorker.waitUntilReady();
    console.log("Course Worker is ready 🚀");
})();