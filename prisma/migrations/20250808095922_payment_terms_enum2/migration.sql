-- AlterTable
ALTER TABLE "global_fees" ALTER COLUMN "payment_terms" DROP DEFAULT;

-- AlterTable
ALTER TABLE "local_fees" ALTER COLUMN "payment_terms" DROP DEFAULT;
