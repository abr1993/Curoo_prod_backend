-- AlterTable
ALTER TABLE "Consult" ADD COLUMN     "decline_reason" TEXT;

-- AlterTable
ALTER TABLE "SpecialtyCondition" ADD COLUMN     "is_upload_allowed" BOOLEAN NOT NULL DEFAULT false;
