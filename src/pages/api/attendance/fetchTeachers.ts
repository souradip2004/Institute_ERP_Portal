import { objectType, stringArg, nonNull } from "nexus";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Teacher = objectType({
    name: "Teacher",
    definition(t) {
        t.string("id");
        t.string("name");
        t.string("email");
        t.string("departmentId");
        t.field("department", {
            type: "Department",
            resolve: (parent) => {
                if (!parent.id) {
                    throw new Error("Teacher ID is required");
                }
                return prisma.teacher.findUnique({ where: { id: parent.id } }).department();
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
        t.list.field("teachers", {
            type: "Teacher",
            resolve: (parent) => {
                if (!parent.id) {
                    throw new Error("Department ID is required");
                }
                return prisma.teacher.findMany({ where: { departmentId: parent.id } });
            },
        });
    },
});

export { Teacher, Department };
