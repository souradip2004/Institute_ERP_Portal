-- AlterTable
ALTER TABLE "credits" ADD COLUMN     "attendance_credits_balance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total" INTEGER NOT NULL DEFAULT 0;
