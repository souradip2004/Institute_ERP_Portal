-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_created_by_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_department_id_fkey";

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
