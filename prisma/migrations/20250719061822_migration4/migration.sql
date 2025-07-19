/*
  Warnings:

  - You are about to drop the column `user_id` on the `notifications` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "user_id",
ADD COLUMN     "student-id" TEXT,
ADD COLUMN     "teacher-id" TEXT;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_teacher-id_fkey" FOREIGN KEY ("teacher-id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_student-id_fkey" FOREIGN KEY ("student-id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
