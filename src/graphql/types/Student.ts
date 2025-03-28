import { objectType, stringArg, nonNull } from "nexus";
import prisma from "../prisma";
/*
  id                  String           @id @default(uuid()) @db.Uuid
  userId              String           @unique @map("user_id") @db.Uuid
  studentId           String           @unique @map("student_id") // Roll number/registration, now unique
  firstName           String           @map("first_name")
  lastName            String           @map("last_name")
  gender              String?
  dateOfBirth         DateTime?        @map("date_of_birth") @db.Date
  address             String?
  phone               String?
  parentGuardianName  String?          @map("parent_guardian_name")
  parentGuardianPhone String?          @map("parent_guardian_phone")
  parentGuardianEmail String?          @map("parent_guardian_email")
  departmentId        String           @map("department_id") @db.Uuid
  batchId             String           @map("batch_id") @db.Uuid
  createdAt           DateTime         @default(now()) @map("created_at")
  updatedAt           DateTime         @updatedAt @map("updated_at")
  currentSemester     Int?             @map("current_semester")
  currentYear         Int?             @map("current_year")
  enrollmentStatus    EnrollmentStatus @map("enrollment_status")
  */
const Student = objectType({
    name: "Student",
    definition(t) {
        t.string("id");
        t.string("userId");
        t.string("studentId");
        t.string("firstName");
        t.string("lastName");
        t.nullable.string("gender");
        t.nullable.field("dateOfBirth", { type: "String" });
        t.nullable.string("address");
        t.nullable.string("phone");
        t.nullable.string("parentGuardianName");
        t.nullable.string("parentGuardianPhone");
        t.nullable.string("parentGuardianEmail");
        t.field("departmentId", { type: "String" });
        t.field("batchId", { type: "String" });
        t.field("createdAt", { type: "String" });
        t.field("updatedAt", { type: "String" });
        t.nullable.int("currentSemester");
        t.nullable.int("currentYear");
        t.field("enrollmentStatus", { type: "String" });
        t.field("department", {
            type: "Department",
            resolve: async (parent) => {
                if (!parent.id) {
                    throw new Error("Student ID is required");
                }
                const department = await prisma.student.findUnique({ where: { id: parent.id } }).department();
                if (!department) return null;
                return {
                    ...department,
                    createdAt: department.createdAt.toISOString(),
                    updatedAt: department.updatedAt.toISOString(),
                };
            },
        });
        t.field("user", {
            type: "User",
            resolve: async (parent) => {
                if (!parent.id) {
                    throw new Error("Student ID is required");
                }
                const user = await prisma.student.findUnique({ where: { id: parent.id } }).user();
                if (!user) return null;
                return {
                    ...user,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString(),
                };
            },
        });
    },
});
export default Student;
