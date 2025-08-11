/*
  Warnings:

  - You are about to drop the column `cashPayment` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `cash_payment` on the `fees_collections` table. All the data in the column will be lost.
  - Made the column `payment_date` on table `PaymentTransaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT "PaymentTransaction_feesCollectionId_fkey";

-- AlterTable
ALTER TABLE "PaymentTransaction" DROP COLUMN "cashPayment",
ADD COLUMN     "cash_payment" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "payment_date" SET NOT NULL;

-- AlterTable
ALTER TABLE "fees_collections" DROP COLUMN "cash_payment",
ADD COLUMN     "latest_payment_date" DATE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_feesCollectionId_fkey" FOREIGN KEY ("feesCollectionId") REFERENCES "fees_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
