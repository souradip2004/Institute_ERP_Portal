-- DropForeignKey
ALTER TABLE "global_fees" DROP CONSTRAINT "global_fees_institution_id_fkey";

-- AlterTable
ALTER TABLE "fees_collections" ALTER COLUMN "payment_method" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "global_fees" ADD CONSTRAINT "global_fees_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
