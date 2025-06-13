/*
  Warnings:

  - You are about to drop the column `classSectionLimit` on the `credits` table. All the data in the column will be lost.
  - You are about to drop the column `reserveLimit` on the `credits` table. All the data in the column will be lost.
  - You are about to drop the column `studentLimit` on the `credits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "class_sections" ADD COLUMN     "creditsUsed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "credits" DROP COLUMN "classSectionLimit",
DROP COLUMN "reserveLimit",
DROP COLUMN "studentLimit";

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "classSectionLimit" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "reserveLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "studentLimit" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "monthly_bills" (
    "id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "question_paper_credits_balance" INTEGER NOT NULL DEFAULT 0,
    "copy_checking_credits_balance" INTEGER NOT NULL DEFAULT 0,
    "attendance_credits_balance" INTEGER NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "monthly_bills_pkey" PRIMARY KEY ("id")
);
