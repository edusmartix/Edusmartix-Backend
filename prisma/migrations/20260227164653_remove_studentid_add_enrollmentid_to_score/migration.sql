/*
  Warnings:

  - You are about to drop the column `student_id` on the `student_subject_scores` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[exam_session_id,enrollment_id,subject_id]` on the table `student_subject_scores` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `enrollment_id` to the `student_subject_scores` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "student_subject_scores_exam_session_id_student_id_subject_i_key";

-- AlterTable
ALTER TABLE "student_subject_scores" DROP COLUMN "student_id",
ADD COLUMN     "enrollment_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "student_subject_scores_exam_session_id_enrollment_id_subjec_key" ON "student_subject_scores"("exam_session_id", "enrollment_id", "subject_id");

-- AddForeignKey
ALTER TABLE "student_subject_scores" ADD CONSTRAINT "student_subject_scores_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
