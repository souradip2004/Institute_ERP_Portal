import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const userWorker = new Worker(
    'user-queue',

    async (job) => {
        console.log("User Worker is processing job:", job.name, job.data);
        switch(job.name){
            case "create-user":
        const result = await prisma.user.create({
            data: job.data.data,
        }).then((batch) => {
            console.log(`user ${job.data.name} created`);
            return batch;
        }).catch((err) => {
            console.error(`Error creating user ${job.data.name}:`, err);
            return null;
        });
        if(result?.id){
            const redisKey = `user:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
        case "update-user":
           const update= await prisma.user.update({
                where: { id: job.data.identity },
                data: job.data.data            })
            if(update?.id){
                const redisKey = `user:${update.id}`;
                redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
            }
            return update;
        case "delete-user":
         const del=await prisma.user.delete({
                where:{id:job.data.identity}
            })
            if(del?.id){
                const redisKey = `user:${del.id}`;
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

userWorker.on('completed', (job) => {
    console.log(`✅ User Job ${job.id} completed`);
}
);
userWorker.on('failed', (job, err) => {
    console.error(`❌ User Job ${job?.id} failed:`, err);
}
);
userWorker.on('progress', (job, progress) => {
    console.log(` User Job ${job.id} is ${progress}% complete`);
}
);
userWorker.on('stalled', (job) => {
    console.log(`User Job ${job} has stalled`);
}
);
userWorker.on('error', (error) => {
    console.error(`User Worker error: ${error}`);
}
);
userWorker.on('paused', () => {
    console.log('User Worker paused');
}
);
userWorker.on('resumed', () => {
    console.log('User Worker resumed');
}
);
userWorker.on('drained', () => {
    console.log('User Worker drained');
}
);
(async () => {
    await userWorker.waitUntilReady();
    console.log("User Worker is ready 🚀");
})();