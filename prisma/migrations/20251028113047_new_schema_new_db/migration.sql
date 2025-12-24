-- AlterTable
ALTER TABLE "SpecialtyCondition" ADD COLUMN     "order" INTEGER;

-- AlterTable
ALTER TABLE "SpecialtySymptom" ADD COLUMN     "order" INTEGER;

-- CreateTable
CREATE TABLE "ConsultImage" (
    "id" TEXT NOT NULL,
    "consult_id" TEXT NOT NULL,
    "image_path" TEXT NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "ConsultImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConsultImage" ADD CONSTRAINT "ConsultImage_consult_id_fkey" FOREIGN KEY ("consult_id") REFERENCES "Consult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
