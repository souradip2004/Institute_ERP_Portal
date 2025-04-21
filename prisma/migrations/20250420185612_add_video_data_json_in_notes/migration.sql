-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "video_data" JSONB;

-- RenameForeignKey
ALTER TABLE "notes" RENAME CONSTRAINT "notes_teacher_id_fkey" TO "notes_creator_teacher_id_fkey";
