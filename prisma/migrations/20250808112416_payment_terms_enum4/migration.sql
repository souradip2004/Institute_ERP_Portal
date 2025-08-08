/*
  Warnings:

  - The values [QUATERLY] on the enum `PaymentTerms` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentTerms_new" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME');
ALTER TABLE "global_fees" ALTER COLUMN "payment_terms" TYPE "PaymentTerms_new" USING ("payment_terms"::text::"PaymentTerms_new");
ALTER TABLE "local_fees" ALTER COLUMN "payment_terms" TYPE "PaymentTerms_new" USING ("payment_terms"::text::"PaymentTerms_new");
ALTER TYPE "PaymentTerms" RENAME TO "PaymentTerms_old";
ALTER TYPE "PaymentTerms_new" RENAME TO "PaymentTerms";
DROP TYPE "PaymentTerms_old";
COMMIT;
