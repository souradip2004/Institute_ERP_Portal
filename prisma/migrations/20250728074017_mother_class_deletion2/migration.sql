-- DropForeignKey
ALTER TABLE "class_fees" DROP CONSTRAINT "class_fees_fee_category_id_fkey";

-- DropForeignKey
ALTER TABLE "class_fees" DROP CONSTRAINT "class_fees_mother_class_id_fkey";

-- AddForeignKey
ALTER TABLE "class_fees" ADD CONSTRAINT "class_fees_fee_category_id_fkey" FOREIGN KEY ("fee_category_id") REFERENCES "fees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_fees" ADD CONSTRAINT "class_fees_mother_class_id_fkey" FOREIGN KEY ("mother_class_id") REFERENCES "MotherClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
