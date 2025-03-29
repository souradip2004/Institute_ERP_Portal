import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const examhWorker = new Worker(
    'exam-queue',
    async (job) => {
        switch(job.name){
            case "create-exam":
        await prisma.batch.create({
            data: job.data.data,
        }).then(() => {
            console.log(`Batch ${job.data.data} created`);
        }).catch((err) => {
            console.error(`Error creating department ${job.data.data}:`, err);
        });
      break;
      case "update-exam":
          await prisma.exam.update({
              where: { id: job.data.identity },
              data: job.data.data   
          })
      break;
      case "delete-exam":
        await prisma.exam.delete({
            where:{id:job.data.identity}
        })
          break;
      default:
          console.log("Invalid Operation in exam work");
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