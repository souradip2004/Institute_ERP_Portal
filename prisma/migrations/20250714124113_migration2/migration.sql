/*
  Warnings:

  - You are about to drop the column `class_section_id` on the `class_fees` table. All the data in the column will be lost.
  - You are about to drop the column `institution_id` on the `local_fees` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[institution_id]` on the table `fees` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "class_fees" DROP CONSTRAINT "class_fees_class_section_id_fkey";

-- DropForeignKey
ALTER TABLE "local_fees" DROP CONSTRAINT "local_fees_institution_id_fkey";

-- AlterTable
ALTER TABLE "class_fees" DROP COLUMN "class_section_id",
ADD COLUMN     "classSectionId" TEXT;

-- AlterTable
ALTER TABLE "local_fees" DROP COLUMN "institution_id";

-- CreateIndex
CREATE UNIQUE INDEX "fees_institution_id_key" ON "fees"("institution_id");

-- AddForeignKey
ALTER TABLE "class_fees" ADD CONSTRAINT "class_fees_classSectionId_fkey" FOREIGN KEY ("classSectionId") REFERENCES "class_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
