/*
  Warnings:

  - Made the column `student-id` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `teacher-id` on table `notifications` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_student-id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_teacher-id_fkey";

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "student-id" SET NOT NULL,
ALTER COLUMN "teacher-id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_teacher-id_fkey" FOREIGN KEY ("teacher-id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_student-id_fkey" FOREIGN KEY ("student-id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
