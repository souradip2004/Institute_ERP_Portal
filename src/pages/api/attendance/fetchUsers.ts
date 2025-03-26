import { makeSchema, objectType, stringArg, nonNull } from "nexus";
import path from "path"
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const User = objectType({
  name: "User",
  definition(t: import("nexus/dist/core").ObjectDefinitionBlock<"User">) {
    t.string("id");
    t.string("email");
    t.boolean("isActive");
    t.field("institution", {
      type: "Institution",
      resolve: (parent) => {
        if (!parent.id) {
          throw new Error("User ID is required");
        }
        return prisma.user.findUnique({ where: { id: parent.id } }).institution();
      },
    });
  },
});
export default User;
