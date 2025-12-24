-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'SELECT', 'MULTISELECT');

-- AlterTable
ALTER TABLE "Consult" ALTER COLUMN "status" SET DEFAULT 'ISDRAFT';

-- CreateTable
CREATE TABLE "SpecialtyForHistory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "SpecialtyForHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryField" (
    "id" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "placeholder" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER,

    CONSTRAINT "HistoryField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryFieldOption" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "HistoryFieldOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "MedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpecialtyForHistory_name_key" ON "SpecialtyForHistory"("name");

-- AddForeignKey
ALTER TABLE "HistoryField" ADD CONSTRAINT "HistoryField_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "SpecialtyForHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryFieldOption" ADD CONSTRAINT "HistoryFieldOption_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "HistoryField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalHistory" ADD CONSTRAINT "MedicalHistory_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "SpecialtyForHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
