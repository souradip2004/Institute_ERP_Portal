import { makeSchema, objectType, stringArg, nonNull } from "nexus";
import path from "path"
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const User = objectType({
  name: "User",
  definition(t: import("nexus/dist/core").ObjectDefinitionBlock<"User">) {
    t.string("id");
    t.string("email");
    t.string("passwordHash");
    t.boolean("isActive");
    t.nullable.string("role");
    t.field("institution", {
      type: "Institution",
      resolve: async (parent) => {
        if (!parent.id) {
          throw new Error("User ID is required");
        }
        const institution = await prisma.user.findUnique({ where: { id: parent.id } }).institution();
        if (institution) {
          return {
            ...institution,
            createdAt: institution.createdAt.toISOString(),
            updatedAt: institution.updatedAt.toISOString(),
            subscriptionEndDate: institution.subscriptionEndDate ? institution.subscriptionEndDate.toISOString() : null,
          };
        }
        return null;
      },
    });
  },
});
export default User;
