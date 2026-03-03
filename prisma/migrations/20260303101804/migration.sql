/*
  Warnings:

  - You are about to drop the column `student_id` on the `student_skill_assessments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[result_sheet_id,enrollmentId,skill_item_id]` on the table `student_skill_assessments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `class_level_id` to the `skill_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrollmentId` to the `student_skill_assessments` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "student_skill_assessments_result_sheet_id_student_id_skill__key";

-- AlterTable
ALTER TABLE "skill_categories" ADD COLUMN     "class_level_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "student_skill_assessments" DROP COLUMN "student_id",
ADD COLUMN     "enrollmentId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "student_skill_assessments_result_sheet_id_enrollmentId_skil_key" ON "student_skill_assessments"("result_sheet_id", "enrollmentId", "skill_item_id");

-- AddForeignKey
ALTER TABLE "skill_categories" ADD CONSTRAINT "skill_categories_class_level_id_fkey" FOREIGN KEY ("class_level_id") REFERENCES "class_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_skill_assessments" ADD CONSTRAINT "student_skill_assessments_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
