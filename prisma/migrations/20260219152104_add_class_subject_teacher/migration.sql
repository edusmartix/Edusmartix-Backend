-- AlterTable
ALTER TABLE "class_arms" ADD COLUMN     "class_teacher_id" INTEGER;

-- AlterTable
ALTER TABLE "class_subjects" ADD COLUMN     "teacher_id" INTEGER;

-- AddForeignKey
ALTER TABLE "class_arms" ADD CONSTRAINT "class_arms_class_teacher_id_fkey" FOREIGN KEY ("class_teacher_id") REFERENCES "staff_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "staff_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
