/*
  Warnings:

  - A unique constraint covering the columns `[user_id,school_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `first_name` to the `parent_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `parent_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `staff_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `staff_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "parent_profiles" ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "password_hash" TEXT;

-- AlterTable
ALTER TABLE "staff_profiles" ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "password_hash" TEXT;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_school_id_key" ON "students"("user_id", "school_id");
