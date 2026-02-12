-- DropIndex
DROP INDEX "academic_sessions_school_id_is_active_key";

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "primary_color" TEXT,
ADD COLUMN     "secondary_color" TEXT;
