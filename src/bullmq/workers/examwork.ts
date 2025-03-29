import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const examhWorker = new Worker(
    'exam-queue',
    async (job) => {
        switch(job.name){
            case "create-exam":
        const result=await prisma.batch.create({
            data: job.data.data,
        }).then((data) => {
            console.log(`Batch ${job.data.data} created`);
            return data;
        }).catch((err) => {
            console.error(`Error creating department ${job.data.data}:`, err);
            return null;
        });
        if(result?.id){
            const redisKey = `exam:${result.id}`;
            redis.set(redisKey, JSON.stringify({ ...job.data.data, id: result.id }));
        }
        return result;
      case "update-exam":
          const update=await prisma.exam.update({
              where: { id: job.data.identity },
              data: job.data.data   
          })
            if(update?.id){
                const redisKey = `exam:${update.id}`;
                redis.set(redisKey, JSON.stringify({ ...job.data.data, id: update.id }));
            }
            return update;
      case "delete-exam":
        const del=await prisma.exam.delete({
            where:{id:job.data.identity}
        })
        if(del?.id){
            const redisKey = `exam:${del.id}`;
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

examhWorker.on('completed', (job) => {
    console.log(`✅ exam Job ${job.id} completed`);
}
);
examhWorker.on('failed', (job, err) => {
    console.error(`❌ exam Job ${job?.id} failed:`, err);
}
);
examhWorker.on('progress', (job, progress) => {
    console.log(` exam Job ${job.id} is ${progress}% complete`);
}
);
examhWorker.on('stalled', (job) => {
    console.log(`exam Job ${job} has stalled`);
}
);
examhWorker.on('error', (error) => {
    console.error(`exam Worker error: ${error}`);
}
);
examhWorker.on('paused', () => {
    console.log('exam Worker paused');
}
);
examhWorker.on('resumed', () => {
    console.log('exam Worker resumed');
}
);
examhWorker.on('drained', () => {
    console.log('exam Worker drained');
}
);
(async () => {
    await examhWorker.waitUntilReady();
    console.log("exam Worker is ready 🚀");
})();