-- CreateEnum
CREATE TYPE "CopyCheckStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PENDING', 'OVERDUE', 'REFUNDED', 'PARTIAL');

-- CreateTable
CREATE TABLE "checkSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "class_section_ids" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_papers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "totalMarks" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_paper_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "question_paper_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "marksPerSection" DOUBLE PRECISION,
    "requiredQuestions" INTEGER,
    "totalQuestionsInSection" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_paper_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cquestions" (
    "id" TEXT NOT NULL,
    "question_paper_section_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cquestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copy_checks" (
    "id" TEXT NOT NULL,
    "check_session_id" TEXT NOT NULL,
    "class_section_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "status" "CopyCheckStatus" NOT NULL,
    "question_paper_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "copy_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_copies" (
    "id" TEXT NOT NULL,
    "copy_check_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "submission_url" TEXT NOT NULL,
    "status" "CopyCheckStatus" NOT NULL,
    "created_ok" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_copies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_Youtubes" (
    "id" TEXT NOT NULL,
    "student_copy_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "submittedAnswer" TEXT NOT NULL,
    "awardedMarks" DOUBLE PRECISION,
    "feedback" TEXT,
    "graded_by_teacher_id" TEXT,
    "gradedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_Youtubes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fees" (
    "id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "account_holder" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "ifsc_code" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "branch_name" TEXT NOT NULL,
    "upi_qr_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "password" TEXT,

    CONSTRAINT "fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_fees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "tax_percentage" DOUBLE PRECISION NOT NULL,
    "payment_terms" TEXT NOT NULL,
    "penalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "institution_id" TEXT NOT NULL,
    "mother_class_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_fees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "tax_percentage" DOUBLE PRECISION NOT NULL,
    "payment_terms" TEXT NOT NULL,
    "penalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "institution_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_fees" (
    "id" TEXT NOT NULL,
    "class_section_id" TEXT NOT NULL,
    "global_fees_id" TEXT,
    "local_fees_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "fee_category_id" TEXT,

    CONSTRAINT "class_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fees_collections" (
    "id" TEXT NOT NULL,
    "class_fee_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_date" DATE NOT NULL,
    "payment_method" TEXT NOT NULL,
    "transaction_id" TEXT,
    "status" "PaymentStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fees_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_fees_on_student" (
    "id" TEXT NOT NULL,
    "local_fees_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_fees_on_student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "local_fees_on_student_local_fees_id_student_id_key" ON "local_fees_on_student"("local_fees_id", "student_id");

-- AddForeignKey
ALTER TABLE "checkSession" ADD CONSTRAINT "checkSession_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_paper_sections" ADD CONSTRAINT "question_paper_sections_question_paper_id_fkey" FOREIGN KEY ("question_paper_id") REFERENCES "question_papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cquestions" ADD CONSTRAINT "cquestions_question_paper_section_id_fkey" FOREIGN KEY ("question_paper_section_id") REFERENCES "question_paper_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "cquestions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copy_checks" ADD CONSTRAINT "copy_checks_check_session_id_fkey" FOREIGN KEY ("check_session_id") REFERENCES "checkSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copy_checks" ADD CONSTRAINT "copy_checks_class_section_id_fkey" FOREIGN KEY ("class_section_id") REFERENCES "class_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copy_checks" ADD CONSTRAINT "copy_checks_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copy_checks" ADD CONSTRAINT "copy_checks_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copy_checks" ADD CONSTRAINT "copy_checks_question_paper_id_fkey" FOREIGN KEY ("question_paper_id") REFERENCES "question_papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_copies" ADD CONSTRAINT "student_copies_copy_check_id_fkey" FOREIGN KEY ("copy_check_id") REFERENCES "copy_checks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_copies" ADD CONSTRAINT "student_copies_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_Youtubes" ADD CONSTRAINT "student_Youtubes_student_copy_id_fkey" FOREIGN KEY ("student_copy_id") REFERENCES "student_copies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_Youtubes" ADD CONSTRAINT "student_Youtubes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_Youtubes" ADD CONSTRAINT "student_Youtubes_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "cquestions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_Youtubes" ADD CONSTRAINT "student_Youtubes_graded_by_teacher_id_fkey" FOREIGN KEY ("graded_by_teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_fees" ADD CONSTRAINT "global_fees_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_fees" ADD CONSTRAINT "global_fees_mother_class_id_fkey" FOREIGN KEY ("mother_class_id") REFERENCES "MotherClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_fees" ADD CONSTRAINT "local_fees_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_fees" ADD CONSTRAINT "class_fees_class_section_id_fkey" FOREIGN KEY ("class_section_id") REFERENCES "class_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_fees" ADD CONSTRAINT "class_fees_global_fees_id_fkey" FOREIGN KEY ("global_fees_id") REFERENCES "global_fees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_fees" ADD CONSTRAINT "class_fees_local_fees_id_fkey" FOREIGN KEY ("local_fees_id") REFERENCES "local_fees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_fees" ADD CONSTRAINT "class_fees_fee_category_id_fkey" FOREIGN KEY ("fee_category_id") REFERENCES "fees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees_collections" ADD CONSTRAINT "fees_collections_class_fee_id_fkey" FOREIGN KEY ("class_fee_id") REFERENCES "class_fees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees_collections" ADD CONSTRAINT "fees_collections_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_fees_on_student" ADD CONSTRAINT "local_fees_on_student_local_fees_id_fkey" FOREIGN KEY ("local_fees_id") REFERENCES "local_fees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_fees_on_student" ADD CONSTRAINT "local_fees_on_student_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
