-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('PRE_SCHOOL', 'PRIMARY', 'SECONDARY', 'TERTIARY');

-- AlterTable
ALTER TABLE "class_levels" ADD COLUMN     "class_category_id" INTEGER;

-- CreateTable
CREATE TABLE "class_categories" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "class_categories_school_id_name_key" ON "class_categories"("school_id", "name");

-- AddForeignKey
ALTER TABLE "class_categories" ADD CONSTRAINT "class_categories_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_levels" ADD CONSTRAINT "class_levels_class_category_id_fkey" FOREIGN KEY ("class_category_id") REFERENCES "class_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
