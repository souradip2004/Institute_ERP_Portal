import {Worker} from 'bullmq';
import {redis} from '../../redis/bullredis';
import prisma from '../../lib/prisma';
const departmentWorker = new Worker(
    'department-queue',
    async (job) => {
        switch (job.name){
            case "create-department":
        await prisma.department.create({
            data: job.data.data,
        }).then(() => {
            console.log(`Department ${job.data.data} created`);
        }).catch((err) => {
            console.error(`Error creating department ${job.data}:`, err);
        });
    break;
    case "update-department":
        await prisma.department.update({
where: { id: job.data.identity },
data: job.data.data,
        }
            
        )
        break;
    case "delete-department":
        await prisma.department.delete({
            where:{id:job.data.identity}
        })
        break;
    default:
        console.log("Invalid Job");

    
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