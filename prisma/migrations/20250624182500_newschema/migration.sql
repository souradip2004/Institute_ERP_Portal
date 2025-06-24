-- AlterTable
ALTER TABLE "class_sections" ADD COLUMN     "isOptional" BOOLEAN DEFAULT false,
ADD COLUMN     "mother_class_id" TEXT;

-- CreateTable
CREATE TABLE "MotherClass" (
    "id" TEXT NOT NULL,
    "section_name" TEXT NOT NULL,

    CONSTRAINT "MotherClass_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "class_sections" ADD CONSTRAINT "class_sections_mother_class_id_fkey" FOREIGN KEY ("mother_class_id") REFERENCES "MotherClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
