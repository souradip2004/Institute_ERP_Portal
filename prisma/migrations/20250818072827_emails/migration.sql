-- CreateTable
CREATE TABLE "email_forms" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "attachments" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "institution_id" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "email_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmailFormClassSections" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmailFormClassSections_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EmailFormClassSections_B_index" ON "_EmailFormClassSections"("B");

-- AddForeignKey
ALTER TABLE "email_forms" ADD CONSTRAINT "email_forms_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailFormClassSections" ADD CONSTRAINT "_EmailFormClassSections_A_fkey" FOREIGN KEY ("A") REFERENCES "class_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailFormClassSections" ADD CONSTRAINT "_EmailFormClassSections_B_fkey" FOREIGN KEY ("B") REFERENCES "email_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
