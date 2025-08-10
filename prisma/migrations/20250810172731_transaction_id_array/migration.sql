/*
  Warnings:

  - The `transaction_id` column on the `fees_collections` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "fees_collections" ADD COLUMN     "cashPayment" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scholarship_amt" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
DROP COLUMN "transaction_id",
ADD COLUMN     "transaction_id" TEXT[];

-- AlterTable
ALTER TABLE "global_fees" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "local_fees" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
