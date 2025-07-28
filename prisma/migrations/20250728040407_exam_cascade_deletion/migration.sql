-- DropForeignKey
ALTER TABLE "answer_scripts" DROP CONSTRAINT "answer_scripts_exam_submission_id_fkey";

-- DropForeignKey
ALTER TABLE "answer_scripts" DROP CONSTRAINT "answer_scripts_question_id_fkey";

-- DropForeignKey
ALTER TABLE "exam_submissions" DROP CONSTRAINT "exam_submissions_exam_id_fkey";

-- AddForeignKey
ALTER TABLE "exam_submissions" ADD CONSTRAINT "exam_submissions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_scripts" ADD CONSTRAINT "answer_scripts_exam_submission_id_fkey" FOREIGN KEY ("exam_submission_id") REFERENCES "exam_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_scripts" ADD CONSTRAINT "answer_scripts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
