import { objectType, stringArg, nonNull } from "nexus";
import prisma from "../prisma";
import {redis} from "../../redis/redis";
/*
 id                 String           @id @default(uuid()) @db.Uuid
  userId             String           @unique @map("user_id") @db.Uuid
  teacherId          String           @unique @map("teacher_id") // Teacher ID now unique
  firstName          String           @map("first_name")
  lastName           String           @map("last_name")
  gender             String?
  dateOfBirth        DateTime?        @map("date_of_birth") @db.Date
  address            String?
  phone              String?
  qualification      String?
  joiningDate        DateTime?        @map("joining_date") @db.Date
  employmentStatus   EmploymentStatus @map("employment_status")
  departmentId       String           @map("department_id") @db.Uuid
  createdAt          DateTime         @default(now()) @map("created_at")
  updatedAt          DateTime         @updatedAt @map("updated_at")
  performanceScore   Float?           @map("performance_score")
  lastEvaluationDate DateTime?        @map("last_evaluation_date") @db.Date
*/

const Teacher = objectType({
    name: "Teacher",
    definition(t) {
        t.string("id");
        t.string("userId");
        t.string("teacherId");
        t.string("firstName");
        t.string("lastName");
        t.nullable.field("employmentStatus", { type: "String" });
        t.field("createdAt", { type: "String" });
        t.field("updatedAt", { type: "String" });
        t.field("gender", { type: "String" });
        t.nullable.field("dateOfBirth", { type: "String" });
        t.nullable.string("address");
        t.nullable.string("phone");
        t.nullable.string("qualification");
        t.nullable.field("joiningDate", { type: "String" });
        t.string("departmentId");
        t.nullable.float("performanceScore");
        t.nullable.field("lastEvaluationDate", { type: "String" });
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



export { Teacher };
