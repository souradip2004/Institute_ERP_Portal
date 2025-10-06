/*
  Warnings:

  - Added the required column `name` to the `email_forms` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `sender` on the `email_forms` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."Sender" AS ENUM ('TEACHER', 'ADMIN');

-- AlterTable
ALTER TABLE "public"."email_forms" ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "sender",
ADD COLUMN     "sender" "public"."Sender" NOT NULL;
