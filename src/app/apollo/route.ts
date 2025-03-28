import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { schema } from "@/graphql/schema";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const server = new ApolloServer({
  schema,
});

export const dynamic = "force-dynamic";

const handler = startServerAndCreateNextHandler(server, {
  context: async () => ({ prisma }),
});

export const GET = handler;
export const POST = handler;
