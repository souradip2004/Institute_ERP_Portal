/*
  Warnings:

  - A unique constraint covering the columns `[class_fee_id,student_id]` on the table `fees_collections` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "fees_collections_class_fee_id_student_id_key" ON "fees_collections"("class_fee_id", "student_id");
