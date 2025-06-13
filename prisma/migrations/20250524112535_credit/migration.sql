/*
  Warnings:

  - You are about to drop the `monthly_bills` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "credit_transactions" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "credits" ADD COLUMN     "month" INTEGER,
ADD COLUMN     "year" INTEGER;

-- DropTable
DROP TABLE "monthly_bills";
