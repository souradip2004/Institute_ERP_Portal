/*
  Warnings:

  - The `subscription_status` column on the `institutions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[institution_id,code]` on the table `departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacher_id]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `question_type` on the `ai_question_banks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `ai_question_banks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `ai_video_content` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `answer_scripts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `session_type` on the `attendance_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `action` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `course_type` on the `courses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `transaction_type` on the `credit_transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `credit_type` on the `credit_transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `exam_submissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `invoices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `question_type` on the `questions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `enrollment_status` on the `student_class_enrollments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `performance_category` on the `student_performance_metrics` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `enrollment_status` on the `students` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `subscriptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `employment_status` on the `teachers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('active', 'graduated', 'suspended', 'withdrawn');

-- CreateEnum
CREATE TYPE "ClassEnrollmentStatus" AS ENUM ('enrolled', 'dropped', 'completed');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('mcq', 'shortAnswer', 'longAnswer', 'coding');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('core', 'elective');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('fullTime', 'partTime', 'contract', 'guest');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('lecture', 'lab', 'tutorial');

-- AlterTable
ALTER TABLE "ai_question_banks" DROP COLUMN "question_type",
ADD COLUMN     "question_type" "QuestionType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "AIContentStatus" NOT NULL;

-- AlterTable
ALTER TABLE "ai_video_content" DROP COLUMN "status",
ADD COLUMN     "status" "AIContentStatus" NOT NULL;

-- AlterTable
ALTER TABLE "answer_scripts" DROP COLUMN "status",
ADD COLUMN     "status" "AnswerScriptStatus" NOT NULL;

-- AlterTable
ALTER TABLE "attendance_sessions" DROP COLUMN "session_type",
ADD COLUMN     "session_type" "SessionType" NOT NULL;

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "action",
ADD COLUMN     "action" "ActionType" NOT NULL;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "course_type",
ADD COLUMN     "course_type" "CourseType" NOT NULL;

-- AlterTable
ALTER TABLE "credit_transactions" DROP COLUMN "transaction_type",
ADD COLUMN     "transaction_type" "TransactionType" NOT NULL,
DROP COLUMN "credit_type",
ADD COLUMN     "credit_type" "CreditType" NOT NULL;

-- AlterTable
ALTER TABLE "exam_submissions" DROP COLUMN "status",
ADD COLUMN     "status" "AnswerScriptStatus" NOT NULL;

-- AlterTable
ALTER TABLE "institutions" DROP COLUMN "subscription_status",
ADD COLUMN     "subscription_status" "SubscriptionStatus";

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "status",
ADD COLUMN     "status" "InvoiceStatus" NOT NULL;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "question_type",
ADD COLUMN     "question_type" "QuestionType" NOT NULL;

-- AlterTable
ALTER TABLE "student_class_enrollments" DROP COLUMN "enrollment_status",
ADD COLUMN     "enrollment_status" "ClassEnrollmentStatus" NOT NULL;

-- AlterTable
ALTER TABLE "student_performance_metrics" DROP COLUMN "performance_category",
ADD COLUMN     "performance_category" "PerformanceCategory" NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "enrollment_status",
ADD COLUMN     "enrollment_status" "EnrollmentStatus" NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "status",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL;

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "employment_status",
ADD COLUMN     "employment_status" "EmploymentStatus" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "departments_institution_id_code_key" ON "departments"("institution_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "students_student_id_key" ON "students"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_teacher_id_key" ON "teachers"("teacher_id");
