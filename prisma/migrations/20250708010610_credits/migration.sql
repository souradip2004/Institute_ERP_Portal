/*
  Warnings:

  - You are about to drop the column `available_credits_balance` on the `credits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "credits" DROP COLUMN "available_credits_balance",
ADD COLUMN     "animation_credits_balance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "section_credits_balance" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "coins" INTEGER NOT NULL DEFAULT 0;
