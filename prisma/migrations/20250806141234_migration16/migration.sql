-- AlterTable
ALTER TABLE "class_fees" ALTER COLUMN "due-date" DROP DEFAULT;

-- AlterTable
ALTER TABLE "fees_collections" ALTER COLUMN "amount" SET DEFAULT 0;
