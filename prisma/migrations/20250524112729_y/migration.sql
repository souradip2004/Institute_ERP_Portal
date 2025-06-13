/*
  Warnings:

  - You are about to drop the column `isPaid` on the `credit_transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "credit_transactions" DROP COLUMN "isPaid";

-- AlterTable
ALTER TABLE "credits" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;
