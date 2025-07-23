-- DropForeignKey
ALTER TABLE "local_fees_on_student" DROP CONSTRAINT "local_fees_on_student_local_fees_id_fkey";

-- AddForeignKey
ALTER TABLE "local_fees_on_student" ADD CONSTRAINT "local_fees_on_student_local_fees_id_fkey" FOREIGN KEY ("local_fees_id") REFERENCES "local_fees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
