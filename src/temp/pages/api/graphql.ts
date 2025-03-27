import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { schema } from "@/temp/graphql/schema";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const server = new ApolloServer({
  schema,
});

export default startServerAndCreateNextHandler(server, {
  context: async () => ({ prisma }),
});
