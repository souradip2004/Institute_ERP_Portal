/*
  Warnings:

  - You are about to drop the column `amount` on the `fees_collections` table. All the data in the column will be lost.
  - You are about to drop the column `cash_payment` on the `fees_collections` table. All the data in the column will be lost.
  - You are about to drop the column `payment_date` on the `fees_collections` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `fees_collections` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_id` on the `fees_collections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "fees_collections" DROP COLUMN "amount",
DROP COLUMN "payment_date",
DROP COLUMN "payment_method",
DROP COLUMN "transaction_id";

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "payment_method" TEXT,
    "transactionId" TEXT,
    "cashPayment" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "feesCollectionId" TEXT DEFAULT 'fees_collection_id',
    "payment_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_feesCollectionId_fkey" FOREIGN KEY ("feesCollectionId") REFERENCES "fees_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
