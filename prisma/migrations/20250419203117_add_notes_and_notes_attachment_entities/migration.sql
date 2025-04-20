-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "class_section_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "subject_name" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "file_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_attachments" (
    "id" TEXT NOT NULL,
    "note_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_attachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_class_section_id_fkey" FOREIGN KEY ("class_section_id") REFERENCES "class_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_attachments" ADD CONSTRAINT "note_attachments_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_attachments" ADD CONSTRAINT "note_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
