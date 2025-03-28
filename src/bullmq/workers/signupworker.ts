import { Worker } from 'bullmq';
import { redis } from '@/redis/redis';
import prisma from '@/lib/prisma';
const emailWorker = new Worker('signup-queue', async (job) => {
prisma.user.create({
    data: {
        email: job.data.email,
        passwordHash: job.data.password,
        role: job.data.role,
        isActive: job.data.isActive,
        institution: job.data.institution
    },
    }).then(() => {
    console.log(`User ${job.data.name} created`);
    }).catch((err) => {
    console.error(`Error creating user ${job.data.name}:`, err);
    });
}, {
  connection: redis
});

emailWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
