/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `schools` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "schools_email_key" ON "schools"("email");
