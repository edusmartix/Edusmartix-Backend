/*
  Warnings:

  - A unique constraint covering the columns `[academic_session_id,name]` on the table `terms` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "terms_academic_session_id_is_active_key";

-- CreateIndex
CREATE UNIQUE INDEX "terms_academic_session_id_name_key" ON "terms"("academic_session_id", "name");
