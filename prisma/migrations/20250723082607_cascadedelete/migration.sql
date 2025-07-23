-- DropForeignKey
ALTER TABLE "class_fees" DROP CONSTRAINT "class_fees_global_fees_id_fkey";

-- DropForeignKey
ALTER TABLE "class_fees" DROP CONSTRAINT "class_fees_local_fees_id_fkey";

-- DropForeignKey
ALTER TABLE "fees_collections" DROP CONSTRAINT "fees_collections_class_fee_id_fkey";

-- AddForeignKey
ALTER TABLE "class_fees" ADD CONSTRAINT "class_fees_global_fees_id_fkey" FOREIGN KEY ("global_fees_id") REFERENCES "global_fees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_fees" ADD CONSTRAINT "class_fees_local_fees_id_fkey" FOREIGN KEY ("local_fees_id") REFERENCES "local_fees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees_collections" ADD CONSTRAINT "fees_collections_class_fee_id_fkey" FOREIGN KEY ("class_fee_id") REFERENCES "class_fees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
