import { makeSchema, objectType, stringArg, nonNull } from "nexus";
import { PrismaClient } from "@prisma/client";
import path from "path"
const prisma = new PrismaClient();
import User from "../pages/api/attendance/fetchUsers";
import { Teacher, Department,Institution} from "../pages/api/attendance/fetchTeachers";

const Query = objectType({
  name: "Query",
  definition(t) {
    t.list.field("users", {
      type: "User",
      resolve: () => prisma.user.findMany(),
    });
    t.list.field("teachers", {
      type: "Teacher",
      resolve: async () => {
        const teachers = await prisma.teacher.findMany();
        return teachers.map((teacher) => ({
          ...teacher,
          createdAt: teacher.createdAt.toISOString(),
          updatedAt: teacher.updatedAt.toISOString(),
          dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.toISOString() : null,
          joiningDate: teacher.joiningDate ? teacher.joiningDate.toISOString() : null,
          lastEvaluationDate: teacher.lastEvaluationDate ? teacher.lastEvaluationDate.toISOString() : null,
        }));
      },
    });
    t.list.field("departments", {
      type: "Department",
      resolve: async () => {
        const departments = await prisma.department.findMany();
        return departments.map((department) => ({
          ...department,
          createdAt: department.createdAt.toISOString(),
          updatedAt: department.updatedAt.toISOString(),
        }));
      },
    });
    t.field("teacher", {
      type: "Teacher",
      args: { id: nonNull(stringArg()) },
      resolve: async (_, { id }) => {
        const teacher = await prisma.teacher.findUnique({ where: { id } });
        return teacher
          ? {
              ...teacher,
              createdAt: teacher.createdAt.toISOString(),
              updatedAt: teacher.updatedAt.toISOString(),
              dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.toISOString() : null,
              joiningDate: teacher.joiningDate ? teacher.joiningDate.toISOString() : null,
              lastEvaluationDate: teacher.lastEvaluationDate ? teacher.lastEvaluationDate.toISOString() : null,
            }
          : null;
      },
    });

    t.field("department", {
      type: "Department",
      args: { id: nonNull(stringArg()) },
      resolve: async (_, { id }) => {
        const department = await prisma.department.findUnique({ where: { id } });
        return department
          ? {
              ...department,
              createdAt: department.createdAt.toISOString(),
              updatedAt: department.updatedAt.toISOString(),
            }
          : null;
      },
    });
t.field("institution", {
      type: "Institution",
      args: { id: nonNull(stringArg()) },
      resolve: async (_, { id }) => {
        const institution = await prisma.institution.findUnique({ where: { id } });
        return institution
          ? {
              ...institution,
              createdAt: institution.createdAt.toISOString(),
              updatedAt: institution.updatedAt.toISOString(),
              subscriptionEndDate: institution.subscriptionEndDate ? institution.subscriptionEndDate.toISOString() : null,
            }
          : null;
      },
    });
    t.list.field("institutions", {
      type: "Institution",
      resolve: async () => {
        const institutions = await prisma.institution.findMany();
        return institutions.map((institution) => ({
          ...institution,
          createdAt: institution.createdAt.toISOString(),
          updatedAt: institution.updatedAt.toISOString(),
          subscriptionEndDate: institution.subscriptionEndDate ? institution.subscriptionEndDate.toISOString() : null,
        }));
      },
    });
    t.field("user", {
      type: "User",
      args: { id: nonNull(stringArg()) },
      resolve: (_, { id }) => prisma.user.findUnique({ where: { id } }),
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
