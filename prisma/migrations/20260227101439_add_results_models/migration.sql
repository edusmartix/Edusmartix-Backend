-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('MIDTERM', 'ENDTERM', 'MOCK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('DRAFT', 'OPEN', 'LOCKED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ResultSheetType" AS ENUM ('TERM', 'ANNUAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ResultSheetStatus" AS ENUM ('DRAFT', 'PROCESSING', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "exam_sessions" (
    "id" SERIAL NOT NULL,
    "academic_session_id" INTEGER NOT NULL,
    "term_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "exam_type" "ExamType" NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'DRAFT',
    "opened_at" TIMESTAMP(3),
    "locked_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_session_class_levels" (
    "id" SERIAL NOT NULL,
    "exam_session_id" INTEGER NOT NULL,
    "class_level_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_session_class_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_division_configs" (
    "id" SERIAL NOT NULL,
    "exam_session_id" INTEGER NOT NULL,
    "class_level_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "max_score" DECIMAL(5,2) NOT NULL,
    "weight" DECIMAL(5,2),
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_division_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_subject_scores" (
    "id" SERIAL NOT NULL,
    "exam_session_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "total_score" DECIMAL(5,2) NOT NULL,
    "grade" TEXT,
    "remark" TEXT,
    "is_absent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_subject_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_score_divisions" (
    "id" SERIAL NOT NULL,
    "student_subject_score_id" INTEGER NOT NULL,
    "score_division_config_id" INTEGER NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_score_divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_sheets" (
    "id" SERIAL NOT NULL,
    "academic_session_id" INTEGER NOT NULL,
    "term_id" INTEGER,
    "class_level_id" INTEGER NOT NULL,
    "class_arm_id" INTEGER,
    "type" "ResultSheetType" NOT NULL,
    "status" "ResultSheetStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "result_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_sheet_exam_sessions" (
    "id" SERIAL NOT NULL,
    "result_sheet_id" INTEGER NOT NULL,
    "exam_session_id" INTEGER NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,

    CONSTRAINT "result_sheet_exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_scales" (
    "id" SERIAL NOT NULL,
    "exam_session_id" INTEGER NOT NULL,
    "class_level_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grading_scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_boundaries" (
    "id" SERIAL NOT NULL,
    "grading_scale_id" INTEGER NOT NULL,
    "min_score" DECIMAL(5,2) NOT NULL,
    "max_score" DECIMAL(5,2) NOT NULL,
    "grade" TEXT NOT NULL,
    "grade_point" DECIMAL(3,2),
    "remark" TEXT,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_boundaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_items" (
    "id" SERIAL NOT NULL,
    "skill_category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "max_score" DECIMAL(5,2),
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "skill_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_skill_assessments" (
    "id" SERIAL NOT NULL,
    "result_sheet_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "skill_item_id" INTEGER NOT NULL,
    "score" DECIMAL(5,2),
    "grade" TEXT,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_skill_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_result_summaries" (
    "id" SERIAL NOT NULL,
    "result_sheet_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "totalScore" DECIMAL(10,2) NOT NULL,
    "average" DECIMAL(5,2) NOT NULL,
    "gpa" DECIMAL(4,2),
    "position_in_arm" INTEGER,
    "position_in_level" INTEGER,
    "total_subjects" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_result_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_cumulative_summaries" (
    "id" SERIAL NOT NULL,
    "result_sheet_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "cumulative_total" DECIMAL(10,2) NOT NULL,
    "cumulative_average" DECIMAL(5,2) NOT NULL,
    "cumulative_gpa" DECIMAL(4,2),
    "promotion_status" TEXT,
    "position_in_level" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_cumulative_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_session_class_levels_exam_session_id_class_level_id_key" ON "exam_session_class_levels"("exam_session_id", "class_level_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_subject_scores_exam_session_id_student_id_subject_i_key" ON "student_subject_scores"("exam_session_id", "student_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_score_divisions_student_subject_score_id_score_divi_key" ON "student_score_divisions"("student_subject_score_id", "score_division_config_id");

-- CreateIndex
CREATE UNIQUE INDEX "result_sheet_exam_sessions_result_sheet_id_exam_session_id_key" ON "result_sheet_exam_sessions"("result_sheet_id", "exam_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_skill_assessments_result_sheet_id_student_id_skill__key" ON "student_skill_assessments"("result_sheet_id", "student_id", "skill_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_result_summaries_result_sheet_id_student_id_key" ON "student_result_summaries"("result_sheet_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_cumulative_summaries_result_sheet_id_student_id_key" ON "student_cumulative_summaries"("result_sheet_id", "student_id");

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_academic_session_id_fkey" FOREIGN KEY ("academic_session_id") REFERENCES "academic_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_class_levels" ADD CONSTRAINT "exam_session_class_levels_exam_session_id_fkey" FOREIGN KEY ("exam_session_id") REFERENCES "exam_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_class_levels" ADD CONSTRAINT "exam_session_class_levels_class_level_id_fkey" FOREIGN KEY ("class_level_id") REFERENCES "class_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_division_configs" ADD CONSTRAINT "score_division_configs_exam_session_id_fkey" FOREIGN KEY ("exam_session_id") REFERENCES "exam_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_division_configs" ADD CONSTRAINT "score_division_configs_class_level_id_fkey" FOREIGN KEY ("class_level_id") REFERENCES "class_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_subject_scores" ADD CONSTRAINT "student_subject_scores_exam_session_id_fkey" FOREIGN KEY ("exam_session_id") REFERENCES "exam_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_score_divisions" ADD CONSTRAINT "student_score_divisions_student_subject_score_id_fkey" FOREIGN KEY ("student_subject_score_id") REFERENCES "student_subject_scores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_score_divisions" ADD CONSTRAINT "student_score_divisions_score_division_config_id_fkey" FOREIGN KEY ("score_division_config_id") REFERENCES "score_division_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_sheet_exam_sessions" ADD CONSTRAINT "result_sheet_exam_sessions_result_sheet_id_fkey" FOREIGN KEY ("result_sheet_id") REFERENCES "result_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_sheet_exam_sessions" ADD CONSTRAINT "result_sheet_exam_sessions_exam_session_id_fkey" FOREIGN KEY ("exam_session_id") REFERENCES "exam_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_scales" ADD CONSTRAINT "grading_scales_exam_session_id_fkey" FOREIGN KEY ("exam_session_id") REFERENCES "exam_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_boundaries" ADD CONSTRAINT "grade_boundaries_grading_scale_id_fkey" FOREIGN KEY ("grading_scale_id") REFERENCES "grading_scales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_items" ADD CONSTRAINT "skill_items_skill_category_id_fkey" FOREIGN KEY ("skill_category_id") REFERENCES "skill_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_skill_assessments" ADD CONSTRAINT "student_skill_assessments_result_sheet_id_fkey" FOREIGN KEY ("result_sheet_id") REFERENCES "result_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_skill_assessments" ADD CONSTRAINT "student_skill_assessments_skill_item_id_fkey" FOREIGN KEY ("skill_item_id") REFERENCES "skill_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_result_summaries" ADD CONSTRAINT "student_result_summaries_result_sheet_id_fkey" FOREIGN KEY ("result_sheet_id") REFERENCES "result_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_cumulative_summaries" ADD CONSTRAINT "student_cumulative_summaries_result_sheet_id_fkey" FOREIGN KEY ("result_sheet_id") REFERENCES "result_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
