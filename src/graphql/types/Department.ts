import { objectType, stringArg, nonNull } from "nexus";
import prisma from "../prisma";
const Department = objectType({
    name: "Department",
    definition(t) {
        t.string("id");
        t.string("name");
        t.string("code");
        t.nullable.string("description");
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
export default Department;