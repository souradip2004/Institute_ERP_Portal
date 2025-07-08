-- AlterTable
ALTER TABLE "credits" ADD COLUMN     "available_credits_balance" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
