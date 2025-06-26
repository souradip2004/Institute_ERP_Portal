-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_institution_id_fkey";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
