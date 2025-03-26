import { makeSchema, objectType, stringArg, nonNull } from "nexus";
import { PrismaClient } from "@prisma/client";
import path from "path"
const prisma = new PrismaClient();
import User from "../pages/api/attendance/fetchUsers";
import { Teacher, Department} from "../pages/api/attendance/fetchTeachers";

const Institution = objectType({
  name: "Institution",
  definition(t) {
    t.string("id");
    t.string("name");
    t.list.field("users", {
      type: "User",
      resolve: (parent) =>
        parent.id ? prisma.institution.findUnique({ where: { id: parent.id } }).users() : null,
    });
  },
});

const Query = objectType({
  name: "Query",
  definition(t) {
    t.list.field("users", {
      type: "User",
      resolve: () => prisma.user.findMany(),
    });
    t.list.field("teachers", {
      type: "Teacher",
      resolve: () => prisma.teacher.findMany(),
    });
    t.list.field("departments", {
      type: "Department",
      resolve: () => prisma.department.findMany(),
    });
    t.field("teacher", {
      type: "Teacher",
      args: { id: nonNull(stringArg()) },
      resolve: (_, { id }) => prisma.teacher.findUnique({ where: { id } }),
    });
    t.field("department", {
      type: "Department",
      args: { id: nonNull(stringArg()) },
      resolve: (_, { id }) => prisma.department.findUnique({ where: { id } }),
    });

    t.field("user", {
      type: "User",
      args: { id: nonNull(stringArg()) },
      resolve: (_, { id }) => prisma.user.findUnique({ where: { id } }),
    });

    t.list.field("institutions", {
      type: "Institution",
      resolve: () => prisma.institution.findMany(),
    });
  },
});

const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.field("createUser", {
      type: "User",
      args: {
        email: nonNull(stringArg()),
        passwordHash: nonNull(stringArg()),
        institutionId: nonNull(stringArg()),
      },
      resolve: async (_, { email, passwordHash, institutionId }) => {
        return prisma.user.create({
          data: { 
            email, 
            passwordHash, 
            institution: { connect: { id: institutionId } }, 
            isActive: true 
          },
        });
      },
    });

    t.field("updateUser", {
      type: "User",
      args: {
        id: nonNull(stringArg()),
        email: stringArg(),
        isActive: stringArg(),
      },
      resolve: async (_, { id, email, isActive }) => {
        return prisma.user.update({
          where: { id },
          data: { 
            ...(email !== undefined && email !== null ? { email } : {}), 
            isActive: isActive === "true" 
          },
        });
      },
    });
    t.field("deleteUser", {
      type: "User",
      args: { id: nonNull(stringArg()) },
      resolve: async (_, { id }) => {
        return prisma.user.delete({ where: { id } });
      },
    });
  },
});

export const schema = makeSchema({
  types: [Query, Mutation, User, Institution,Teacher,Department],
  outputs: {
    schema: path.join(process.cwd(), "src/graphql/schema.graphql"), // Absolute path
    typegen: path.join(process.cwd(), "src/graphql/nexus-typegen.ts"), // Absolute path
  },
});
