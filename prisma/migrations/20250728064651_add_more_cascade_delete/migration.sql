-- DropForeignKey
ALTER TABLE "assignment_attachments" DROP CONSTRAINT "assignment_attachments_uploaded_by_fkey";

-- DropForeignKey
ALTER TABLE "assignment_comments" DROP CONSTRAINT "assignment_comments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "assignment_group_members" DROP CONSTRAINT "assignment_group_members_student_id_fkey";

-- DropForeignKey
ALTER TABLE "assignment_submissions" DROP CONSTRAINT "assignment_submissions_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "assignment_submissions" DROP CONSTRAINT "assignment_submissions_graded_by_fkey";

-- DropForeignKey
ALTER TABLE "assignment_submissions" DROP CONSTRAINT "assignment_submissions_student_id_fkey";

-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_attendance_session_id_fkey";

-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_recorded_by_fkey";

-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_student_id_fkey";

-- DropForeignKey
ALTER TABLE "exam_submissions" DROP CONSTRAINT "exam_submissions_graded_by_fkey";

-- DropForeignKey
ALTER TABLE "exam_submissions" DROP CONSTRAINT "exam_submissions_student_id_fkey";

-- DropForeignKey
ALTER TABLE "fees_collections" DROP CONSTRAINT "fees_collections_student_id_fkey";

-- DropForeignKey
ALTER TABLE "local_fees_on_student" DROP CONSTRAINT "local_fees_on_student_student_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_student-id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_teacher-id_fkey";

-- DropForeignKey
ALTER TABLE "student_Youtubes" DROP CONSTRAINT "student_Youtubes_graded_by_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "student_Youtubes" DROP CONSTRAINT "student_Youtubes_question_id_fkey";

-- DropForeignKey
ALTER TABLE "student_Youtubes" DROP CONSTRAINT "student_Youtubes_student_copy_id_fkey";

-- DropForeignKey
ALTER TABLE "student_Youtubes" DROP CONSTRAINT "student_Youtubes_student_id_fkey";

-- DropForeignKey
ALTER TABLE "student_class_enrollments" DROP CONSTRAINT "student_class_enrollments_class_section_id_fkey";

-- DropForeignKey
ALTER TABLE "student_class_enrollments" DROP CONSTRAINT "student_class_enrollments_student_id_fkey";

-- DropForeignKey
ALTER TABLE "student_copies" DROP CONSTRAINT "student_copies_copy_check_id_fkey";

-- DropForeignKey
ALTER TABLE "student_copies" DROP CONSTRAINT "student_copies_student_id_fkey";

-- DropForeignKey
ALTER TABLE "student_performance_metrics" DROP CONSTRAINT "student_performance_metrics_class_section_id_fkey";

-- DropForeignKey
ALTER TABLE "student_performance_metrics" DROP CONSTRAINT "student_performance_metrics_semester_id_fkey";

-- DropForeignKey
ALTER TABLE "student_performance_metrics" DROP CONSTRAINT "student_performance_metrics_student_id_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_department_id_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_user_id_fkey";

-- DropForeignKey
ALTER TABLE "video_view_logs" DROP CONSTRAINT "video_view_logs_student_id_fkey";

-- DropForeignKey
ALTER TABLE "video_view_logs" DROP CONSTRAINT "video_view_logs_video_id_fkey";

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_class_enrollments" ADD CONSTRAINT "student_class_enrollments_class_section_id_fkey" FOREIGN KEY ("class_section_id") REFERENCES "class_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_class_enrollments" ADD CONSTRAINT "student_class_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_attendance_session_id_fkey" FOREIGN KEY ("attendance_session_id") REFERENCES "attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_copies" ADD CONSTRAINT "student_copies_copy_check_id_fkey" FOREIGN KEY ("copy_check_id") REFERENCES "copy_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_copies" ADD CONSTRAINT "student_copies_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_Youtubes" ADD CONSTRAINT "student_Youtubes_student_copy_id_fkey" FOREIGN KEY ("student_copy_id") REFERENCES "student_copies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_Youtubes" ADD CONSTRAINT "student_Youtubes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_Youtubes" ADD CONSTRAINT "student_Youtubes_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "cquestions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_Youtubes" ADD CONSTRAINT "student_Youtubes_graded_by_teacher_id_fkey" FOREIGN KEY ("graded_by_teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees_collections" ADD CONSTRAINT "fees_collections_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_fees_on_student" ADD CONSTRAINT "local_fees_on_student_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_submissions" ADD CONSTRAINT "exam_submissions_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_submissions" ADD CONSTRAINT "exam_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_view_logs" ADD CONSTRAINT "video_view_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_view_logs" ADD CONSTRAINT "video_view_logs_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "ai_video_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_performance_metrics" ADD CONSTRAINT "student_performance_metrics_class_section_id_fkey" FOREIGN KEY ("class_section_id") REFERENCES "class_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_performance_metrics" ADD CONSTRAINT "student_performance_metrics_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_performance_metrics" ADD CONSTRAINT "student_performance_metrics_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_teacher-id_fkey" FOREIGN KEY ("teacher-id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_student-id_fkey" FOREIGN KEY ("student-id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_attachments" ADD CONSTRAINT "assignment_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_group_members" ADD CONSTRAINT "assignment_group_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_comments" ADD CONSTRAINT "assignment_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
