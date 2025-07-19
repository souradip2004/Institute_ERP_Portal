-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_student-id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_teacher-id_fkey";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "broadcastMessage" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "student-id" DROP NOT NULL,
ALTER COLUMN "teacher-id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_teacher-id_fkey" FOREIGN KEY ("teacher-id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_student-id_fkey" FOREIGN KEY ("student-id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
