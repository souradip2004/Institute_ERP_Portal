-- CreateTable
CREATE TABLE "teacher_course_section_relations" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "class_section_id" TEXT NOT NULL,
    "semester_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_course_section_relations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_course_section_relations_teacher_id_course_id_class_key" ON "teacher_course_section_relations"("teacher_id", "course_id", "class_section_id", "semester_id");

-- AddForeignKey
ALTER TABLE "teacher_course_section_relations" ADD CONSTRAINT "teacher_course_section_relations_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_section_relations" ADD CONSTRAINT "teacher_course_section_relations_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_section_relations" ADD CONSTRAINT "teacher_course_section_relations_class_section_id_fkey" FOREIGN KEY ("class_section_id") REFERENCES "class_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_section_relations" ADD CONSTRAINT "teacher_course_section_relations_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
