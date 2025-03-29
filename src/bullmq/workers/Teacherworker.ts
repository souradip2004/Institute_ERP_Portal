import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const teacherWorker = new Worker(
    'teacher-queue',
    async (job) => {
        switch(job.name){
            case "create-teacher":
       const result= await prisma.teacher.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`teacher ${job.data.data} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating department ${job.data.data}:`, err);
        });
        if(result?.id){
            const redisKey = `teacher:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
        case "update-teacher":
            const update=await prisma.teacher.update({
                where: { id: job.data.identity },
                data: job.data.data   
            })
            if(update?.id){
                const redisKey = `teacher:${update.id}`;
                redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
            }
            return update;
        case "delete-teacher":
            const del=await prisma.teacher.delete({
                where:{id:job.data.identity}
            })
            if(del?.id){
                const redisKey = `teacher:${del.id}`;
                redis.del(redisKey);
            }
            return del;
        default:
            throw new Error('Invalid job name');
        }  },
    {
        connection: redis
    }
);

teacherWorker.on('completed', (job) => {
    console.log(`✅ Teacher Job ${job.id} completed`);
}
);
teacherWorker.on('failed', (job, err) => {
    console.error(`❌ Teacher Job ${job?.id} failed:`, err);
}
);
teacherWorker.on('progress', (job, progress) => {
    console.log(` Teacher Job ${job.id} is ${progress}% complete`);
}
);
teacherWorker.on('stalled', (job) => {
    console.log(`Teacher Job ${job} has stalled`);
}
);
teacherWorker.on('error', (error) => {
    console.error(`Teacher Worker error: ${error}`);
}
);
teacherWorker.on('paused', () => {
    console.log('Teacher Worker paused');
}
);
teacherWorker.on('resumed', () => {
    console.log('Teacher Worker resumed');
}
);
teacherWorker.on('drained', () => {
    console.log('Teacher Worker drained');
}
);
(async () => {
    await teacherWorker.waitUntilReady();
    console.log("Teacher Worker is ready 🚀");
})();