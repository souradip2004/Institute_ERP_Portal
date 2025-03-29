import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const examhWorker = new Worker(
    'examtype-queue',
    async (job) => {
        switch(job.name){
            case "create-examtype":
        await prisma.examType.create({
            data: job.data.data,
        }).then(() => {
            console.log(`examtype ${job.data.data} created`);
        }).catch((err) => {
            console.error(`Error creating examtype ${job.data.data}:`, err);
        });
        break;
        case "update-examtype":
            await prisma.examType.update({
                where: { id: job.data.identity },
                data: job.data.data   
            })
        break;
        case "delete-course":
            await prisma.examType.delete({
                where:{id:job.data.identity}
            })
            break;
        default:
            console.log("Invalid Operation in examtype work");
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