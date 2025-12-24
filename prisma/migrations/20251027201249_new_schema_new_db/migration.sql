/*
  Warnings:

  - The values [PHYSICIAN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `blur` on the `Consult` table. All the data in the column will be lost.
  - You are about to drop the column `light_sensitivity` on the `Consult` table. All the data in the column will be lost.
  - You are about to drop the column `pain` on the `Consult` table. All the data in the column will be lost.
  - You are about to drop the column `redness` on the `Consult` table. All the data in the column will be lost.
  - You are about to drop the column `daily_cap` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `price_cents` on the `Provider` table. All the data in the column will be lost.
  - The primary key for the `ProviderLicense` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProviderSpecialty` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `ProviderLicense` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `provider_speciality_id` to the `ProviderLicense` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `ProviderSpecialty` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('PATIENT', 'PROVIDER');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TABLE "AuditLog" ALTER COLUMN "actor_role" TYPE "UserRole_new" USING ("actor_role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "Consult" DROP COLUMN "blur",
DROP COLUMN "light_sensitivity",
DROP COLUMN "pain",
DROP COLUMN "redness",
ADD COLUMN     "allergies" TEXT;

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "daily_cap",
DROP COLUMN "price_cents";

-- AlterTable
ALTER TABLE "ProviderLicense" DROP CONSTRAINT "ProviderLicense_pkey",
ADD COLUMN     "daily_cap" INTEGER,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price_cents" DECIMAL(10,2),
ADD COLUMN     "provider_speciality_id" TEXT NOT NULL,
ADD CONSTRAINT "ProviderLicense_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProviderSpecialty" DROP CONSTRAINT "ProviderSpecialty_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ProviderSpecialty_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Symptom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialtySymptom" (
    "id" TEXT NOT NULL,
    "specialty_id" TEXT NOT NULL,
    "symptom_id" TEXT NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "SpecialtySymptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultSpecialtySymptom" (
    "id" TEXT NOT NULL,
    "consult_id" TEXT NOT NULL,
    "specialty_symptom_id" TEXT NOT NULL,
    "Value" INTEGER NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "ConsultSpecialtySymptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialtyCondition" (
    "id" TEXT NOT NULL,
    "specialty_id" TEXT NOT NULL,
    "condition_id" TEXT NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "SpecialtyCondition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Symptom_name_key" ON "Symptom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Condition_name_key" ON "Condition"("name");

-- AddForeignKey
ALTER TABLE "SpecialtySymptom" ADD CONSTRAINT "SpecialtySymptom_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialtySymptom" ADD CONSTRAINT "SpecialtySymptom_symptom_id_fkey" FOREIGN KEY ("symptom_id") REFERENCES "Symptom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultSpecialtySymptom" ADD CONSTRAINT "ConsultSpecialtySymptom_specialty_symptom_id_fkey" FOREIGN KEY ("specialty_symptom_id") REFERENCES "SpecialtySymptom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultSpecialtySymptom" ADD CONSTRAINT "ConsultSpecialtySymptom_consult_id_fkey" FOREIGN KEY ("consult_id") REFERENCES "Consult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialtyCondition" ADD CONSTRAINT "SpecialtyCondition_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialtyCondition" ADD CONSTRAINT "SpecialtyCondition_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "Condition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderLicense" ADD CONSTRAINT "ProviderLicense_provider_speciality_id_fkey" FOREIGN KEY ("provider_speciality_id") REFERENCES "ProviderSpecialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
