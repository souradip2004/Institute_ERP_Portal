/*
  Warnings:

  - You are about to drop the column `cashPayment` on the `fees_collections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "fees_collections" DROP COLUMN "cashPayment",
ADD COLUMN     "cash_payment" BOOLEAN NOT NULL DEFAULT false;
