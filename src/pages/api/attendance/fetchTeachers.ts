import { objectType, stringArg, nonNull } from "nexus";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Teacher = objectType({
    name: "Teacher",
    definition(t) {
        t.string("id");
        t.string("userId");
        t.string("teacherId");
        t.string("firstName");
        t.string("lastName");
        t.field("employmentStatus", { type: "String" });
        t.field("createdAt", { type: "String" });
        t.field("updatedAt", { type: "String" });
        t.field("gender", { type: "String" });
        t.field("dateOfBirth", { type: "String" });
        t.string("address");
        t.string("phone");
        t.string("qualification");
        t.field("joiningDate", { type: "String" });
        t.string("departmentId");
        t.float("performanceScore");
        t.field("lastEvaluationDate", { type: "String" });
        t.field("department", {
            type: "Department",
            resolve: async (parent) => {
                if (!parent.id) {
                    throw new Error("Teacher ID is required");
                }
                const department = await prisma.teacher.findUnique({ where: { id: parent.id } }).department();
                if (!department) return null;
                return {
                    ...department,
                    createdAt: department.createdAt.toISOString(),
                    updatedAt: department.updatedAt.toISOString(),
                };
            },
        });
    },
});

const Department = objectType({
    name: "Department",
    definition(t) {
        t.string("id");
        t.string("name");
        t.string("code");
        t.string("description");
        t.string("institutionId");
        t.field("createdAt", { type: "String" });
        t.field("updatedAt", { type: "String" });
        t.list.field("teachers", {
            type: "Teacher",
            resolve: async (parent) => {
                if (!parent.id) {
                    throw new Error("Department ID is required");
                }
                const teachers = await prisma.teacher.findMany({ where: { departmentId: parent.id } });
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
    },
});

const Institution = objectType({
    name: "Institution",
    definition(t) {
        t.string("id");
        t.string("name");
        t.string("type");
        t.string("address");
        t.string("city");
        t.string("state");
        t.string("country");
        t.string("postalCode");
        t.string("phone");
        t.string("email");
        t.string("website");
        t.field("createdAt", { type: "String" });
        t.field("updatedAt", { type: "String" });
        t.string("logoUrl");
        t.string("primaryColor");
        t.field("subscriptionStatus", { 
            type: "String", 
        });
        t.field("subscriptionEndDate", { type: "String" });
        t.string("subscriptionPlanId");
        t.list.field("users", {
            type: "User",
            resolve: (parent) =>
                parent.id ? prisma.institution.findUnique({ where: { id: parent.id } }).users() : null,
        });
    },
});


export { Teacher, Department ,Institution};
