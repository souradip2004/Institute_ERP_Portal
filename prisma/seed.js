import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
  const tablenames = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
  
  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");
  
  try {
    if (tables.length > 0) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  } catch (error) {
    console.log("Error while cleaning database:", error);
  }
}
async 
async function main() {
  try {
    await cleanDatabase();
    await prisma.user.create({})
  } catch (e) {
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => console.log(e));
