import { makeSchema, objectType, stringArg, nonNull } from "nexus";
import { PrismaClient } from "@prisma/client";
import path from "path"
import {redis} from "../redis/redis"
const prisma = new PrismaClient();
import User from "./types/Users";
import { Teacher } from "./types/Teachers";
import Institution from "./types/Institution";
import Department from "./types/Department";
import { hashPassword } from '@/lib/auth';
import Student from "./types/Student";
enum Role {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  DEPARTMENT_HEAD="DEPARTMENT_HEAD",
}
const Query = objectType({
  name: "Query",
  definition(t) {
    t.list.field("users", {
      type: "User",
      resolve: async() =>{
        const cacheUsers = await redis.get("users");
        if (cacheUsers) {
          console.log("Cache hit for users");
          return JSON.parse(cacheUsers);
        }
        console.log("Cache miss for users");
        const users = await prisma.user.findMany();
        await redis.set("users", JSON.stringify(users));
        return users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
        }))},
    });
    
    t.list.field("teachers", {
      type: "Teacher",
      resolve: async () => {
        const cacheteachers = await redis.get("teachers");
        if (cacheteachers) {
          console.log("Cache hit for teachers");
          return JSON.parse(cacheteachers);
        }
        const teachers = await prisma.teacher.findMany();
        await redis.set("teachers", JSON.stringify(teachers));
        console.log("Cache miss for teachers");
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
        const cacheDepartments = await redis.get("departments");
        if (cacheDepartments) {
          console.log("Cache hit for departments");
          return JSON.parse(cacheDepartments);
        }
        const departments = await prisma.department.findMany();
        await redis.set("departments", JSON.stringify(departments));
        console.log("Cache miss for departments");
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
        const cacheTeacher = await redis.get(`teacher:${id}`);
        if (cacheTeacher) {
          console.log("Cache hit for teacher");
          return JSON.parse(cacheTeacher);
        }
        console.log("Cache miss for teacher");
        const teacher = await prisma.teacher.findUnique({ where: { id } });
        if (teacher) {
          await redis.set(`teacher:${id}`, JSON.stringify(teacher));
        }
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
    t.list.field("students", {
      type: "Student",
      resolve: async () => {
        const cacheStudents = await redis.get("students");
        if (cacheStudents) {
          console.log("Cache hit for students");
          return JSON.parse(cacheStudents);
        }
        console.log("Cache miss for students");
        const students = await prisma.student.findMany();
        await redis.set("students", JSON.stringify(students));        
        return students.map((student) => ({
          ...student,
          createdAt: student.createdAt.toISOString(),
          updatedAt: student.updatedAt.toISOString(),
          dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString() : null,
        }));
      },
    });
    t.field("student", {
      type: "Student",
      args: { id: nonNull(stringArg()) },
      resolve: async (_, { id }) => {
        const cacheStudent = await redis.get(`student:${id}`);
        if (cacheStudent) {
          console.log("Cache hit for student");
          return JSON.parse(cacheStudent);
        }
        console.log("Cache miss for student");
        const student = await prisma.student.findUnique({ where: { id } });
        if (student) {
          await redis.set(`student:${id}`, JSON.stringify(student));
        }
        return student
          ? {
              ...student,
              createdAt: student.createdAt.toISOString(),
              updatedAt: student.updatedAt.toISOString(),
              dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString() : null,
            }
          : null;
      }
    }
    )

    t.field("department", {
      type: "Department",
      args: { id: nonNull(stringArg()) },
      resolve: async (_, { id }) => {
        const cacheDepartment = await redis.get(`department:${id}`);
        if (cacheDepartment) {
          console.log("Cache hit for department");
          return JSON.parse(cacheDepartment);
        }
        console.log("Cache miss for department");
        const department = await prisma.department.findUnique({ where: { id } });
        if (department) {
          await redis.set(`department:${id}`, JSON.stringify(department));
        }
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
        const cacheInstitution = await redis.get(`institution:${id}`);
        if (cacheInstitution) {
          console.log("Cache hit for institution");
          return JSON.parse(cacheInstitution);
        }
        console.log("Cache miss for institution");
        const institution = await prisma.institution.findUnique({ where: { id } });
        if (institution) {
          await redis.set(`institution:${id}`, JSON.stringify(institution));
        }
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
        const cacheInstitutions = await redis.get("institutions");
        if (cacheInstitutions) {
          console.log("Cache hit for institutions");
          return JSON.parse(cacheInstitutions);
        }
        console.log("Cache miss for institutions");
        const institutions = await prisma.institution.findMany();
        await redis.set("institutions", JSON.stringify(institutions));
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

      args: { email: nonNull(stringArg()) },
      resolve: async(_, { email }) => {
        const cacheUser = await redis.get(`user:${email}`);
        if (cacheUser) {
          console.log("Cache hit for user");
          return JSON.parse(cacheUser);
        }
        console.log("Cache miss for user");
        const user = prisma.user.findUnique({ where: { email } });
        if (user) {
          redis.set(`user:${email}`, JSON.stringify(user));
        }
        return user
        },
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
        role: stringArg(),
      },
      resolve: async (_, { email, passwordHash, institutionId,role }) => {
      let hashPassword1:string=await hashPassword(passwordHash); 
      console.log(hashPassword1);
      const userRole: Role = role ? (Role[role as keyof typeof Role] ?? Role.STUDENT) : Role.STUDENT;
      return prisma.user.create({
          data: { 
            email, 
            passwordHash:hashPassword1, 
            institution: { connect: { id: institutionId } }, 
            isActive: true,
            role: userRole, 
          },
        });
      },
    });
t.field("createInstitution", {
      type: "Institution",
      args: {
        name: nonNull(stringArg()),
        type: nonNull(stringArg()),
        address: stringArg(),
        city: stringArg(),
        state: stringArg(),
        country: stringArg(),
        postalCode: stringArg(),
        phone: stringArg(),
        email: stringArg(),
        website: stringArg(),
        logoUrl: stringArg(),
        primaryColor: stringArg(),
        subscriptionStatus: nonNull(stringArg()),
        subscriptionEndDate: stringArg(),
        subscriptionPlanId: stringArg(),
      },
      resolve: async (_, args) => {
        const institution = await prisma.institution.create({ 
          data: {
            ...args,
            subscriptionStatus: null,
            subscriptionPlanId: args.subscriptionPlanId ?? null,
          },
        });
        return {
          ...institution,
          createdAt: institution.createdAt.toISOString(),
          updatedAt: institution.updatedAt.toISOString(),
          subscriptionEndDate: institution.subscriptionEndDate ? institution.subscriptionEndDate.toISOString() : null,
        };
      },
    }
);
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
  types: [Query, Mutation, User, Institution,Teacher,Department,Student],
  outputs: {
    schema: path.join(process.cwd(), "src/graphql/schema.graphql"), // Absolute path
    typegen: path.join(process.cwd(), "src/graphql/nexus-typegen.ts"), // Absolute path
  },
});
