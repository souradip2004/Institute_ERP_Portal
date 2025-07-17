/*
  Warnings:

  - You are about to drop the column `classSectionId` on the `class_fees` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mother_class_id]` on the table `class_fees` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mother_class_id` to the `class_fees` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "class_fees" DROP CONSTRAINT "class_fees_classSectionId_fkey";

-- AlterTable
ALTER TABLE "class_fees" DROP COLUMN "classSectionId",
ADD COLUMN     "mother_class_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "class_fees_mother_class_id_key" ON "class_fees"("mother_class_id");

-- AddForeignKey
ALTER TABLE "class_fees" ADD CONSTRAINT "class_fees_mother_class_id_fkey" FOREIGN KEY ("mother_class_id") REFERENCES "MotherClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
