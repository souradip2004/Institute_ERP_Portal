/*
  Warnings:

  - Added the required column `qNo` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "qNo" INTEGER NOT NULL;
