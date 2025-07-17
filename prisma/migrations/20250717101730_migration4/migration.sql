/*
  Warnings:

  - You are about to drop the column `mother_class_id` on the `global_fees` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "global_fees" DROP CONSTRAINT "global_fees_mother_class_id_fkey";

-- AlterTable
ALTER TABLE "global_fees" DROP COLUMN "mother_class_id";
