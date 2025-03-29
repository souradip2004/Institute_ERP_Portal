import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const teacherWorker = new Worker(
    'teacher-queue',
    async (job) => {
        switch(job.name){
            case "create-teacher":
        await prisma.teacher.create({
            data: job.data.data,
        }).then(() => {
            console.log(`teacher ${job.data.data} created`);
        }).catch((err) => {
            console.error(`Error creating department ${job.data.data}:`, err);
        });
        break;
        case "update-teacher":
            await prisma.teacher.update({
                where: { id: job.data.identity },
                data: job.data.data   
            })
        break;
        case "delete-teacher":
            await prisma.teacher.delete({
                where:{id:job.data.identity}
            })
            break;
        default:
            console.log("Invalid Operation in teacher work");
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