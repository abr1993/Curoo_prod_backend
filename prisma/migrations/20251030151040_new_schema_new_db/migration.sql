/*
  Warnings:

  - You are about to drop the column `allergies` on the `Consult` table. All the data in the column will be lost.
  - You are about to drop the column `medications` on the `Consult` table. All the data in the column will be lost.
  - You are about to drop the `ConsultEyeHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConsultSystemic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConsultTopic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalHistory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[history_template_id]` on the table `Specialty` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider_specialty_id` to the `Consult` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConditionVisibilityType" AS ENUM ('ONINFOPAGE', 'ONFORMPAGE', 'ONBOTH');

-- DropForeignKey
ALTER TABLE "public"."ConsultEyeHistory" DROP CONSTRAINT "ConsultEyeHistory_consult_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConsultSystemic" DROP CONSTRAINT "ConsultSystemic_consult_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConsultTopic" DROP CONSTRAINT "ConsultTopic_consult_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."MedicalHistory" DROP CONSTRAINT "MedicalHistory_specialtyId_fkey";

-- AlterTable
ALTER TABLE "Consult" DROP COLUMN "allergies",
DROP COLUMN "medications",
ADD COLUMN     "provider_specialty_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Specialty" ADD COLUMN     "history_template_id" TEXT,
ADD COLUMN     "themecolor" TEXT;

-- AlterTable
ALTER TABLE "SpecialtyCondition" ADD COLUMN     "type" "ConditionVisibilityType" NOT NULL DEFAULT 'ONBOTH';

-- DropTable
DROP TABLE "public"."ConsultEyeHistory";

-- DropTable
DROP TABLE "public"."ConsultSystemic";

-- DropTable
DROP TABLE "public"."ConsultTopic";

-- DropTable
DROP TABLE "public"."MedicalHistory";

-- DropEnum
DROP TYPE "public"."EyeHistory";

-- DropEnum
DROP TYPE "public"."Systemic";

-- DropEnum
DROP TYPE "public"."Topic";

-- CreateTable
CREATE TABLE "ConsultSpecialtyCondition" (
    "id" TEXT NOT NULL,
    "consult_id" TEXT NOT NULL,
    "specialty_condition_id" TEXT NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "ConsultSpecialtyCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultMedicalHistory" (
    "id" TEXT NOT NULL,
    "consult_id" TEXT NOT NULL,
    "specialty_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ConsultMedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsultMedicalHistory_consult_id_key" ON "ConsultMedicalHistory"("consult_id");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_history_template_id_key" ON "Specialty"("history_template_id");

-- AddForeignKey
ALTER TABLE "Specialty" ADD CONSTRAINT "Specialty_history_template_id_fkey" FOREIGN KEY ("history_template_id") REFERENCES "SpecialtyForHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultSpecialtyCondition" ADD CONSTRAINT "ConsultSpecialtyCondition_specialty_condition_id_fkey" FOREIGN KEY ("specialty_condition_id") REFERENCES "SpecialtyCondition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultSpecialtyCondition" ADD CONSTRAINT "ConsultSpecialtyCondition_consult_id_fkey" FOREIGN KEY ("consult_id") REFERENCES "Consult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultMedicalHistory" ADD CONSTRAINT "ConsultMedicalHistory_consult_id_fkey" FOREIGN KEY ("consult_id") REFERENCES "Consult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultMedicalHistory" ADD CONSTRAINT "ConsultMedicalHistory_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "SpecialtyForHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consult" ADD CONSTRAINT "Consult_provider_specialty_id_fkey" FOREIGN KEY ("provider_specialty_id") REFERENCES "ProviderSpecialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
