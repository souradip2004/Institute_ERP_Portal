/*
  Warnings:

  - The `payment_terms` column on the `global_fees` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `payment_terms` column on the `local_fees` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentTerms" AS ENUM ('MONTHLY', 'QUATERLY', 'HALF_YEARLY', 'YEARLY');

-- AlterTable
ALTER TABLE "fees_collections" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "global_fees" DROP COLUMN "payment_terms",
ADD COLUMN     "payment_terms" "PaymentTerms" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "local_fees" DROP COLUMN "payment_terms",
ADD COLUMN     "payment_terms" "PaymentTerms" NOT NULL DEFAULT 'MONTHLY';
