/*
  Warnings:

  - You are about to drop the column `physician_id` on the `Consult` table. All the data in the column will be lost.
  - You are about to drop the `PhysicianLicensure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhysicianOutOfOffice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhysicianProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhysicianSpecialty` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `provider_id` to the `Consult` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Consult" DROP CONSTRAINT "Consult_physician_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."PhysicianLicensure" DROP CONSTRAINT "PhysicianLicensure_physician_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."PhysicianOutOfOffice" DROP CONSTRAINT "PhysicianOutOfOffice_physician_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."PhysicianProfile" DROP CONSTRAINT "PhysicianProfile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."PhysicianSpecialty" DROP CONSTRAINT "PhysicianSpecialty_physician_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."PhysicianSpecialty" DROP CONSTRAINT "PhysicianSpecialty_specialty_id_fkey";

-- AlterTable
ALTER TABLE "Consult" DROP COLUMN "physician_id",
ADD COLUMN     "provider_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."PhysicianLicensure";

-- DropTable
DROP TABLE "public"."PhysicianOutOfOffice";

-- DropTable
DROP TABLE "public"."PhysicianProfile";

-- DropTable
DROP TABLE "public"."PhysicianSpecialty";

-- CreateTable
CREATE TABLE "Provider" (
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar" TEXT,
    "price_cents" DECIMAL(10,2),
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "daily_cap" INTEGER,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "ProviderOutOfOffice" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "ooo_start" TIMESTAMP(3) NOT NULL,
    "ooo_end" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "ProviderOutOfOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderSpecialty" (
    "provider_id" TEXT NOT NULL,
    "specialty_id" TEXT NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "ProviderSpecialty_pkey" PRIMARY KEY ("provider_id","specialty_id")
);

-- CreateTable
CREATE TABLE "ProviderLicense" (
    "provider_id" TEXT NOT NULL,
    "state" "USState" NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "ProviderLicense_pkey" PRIMARY KEY ("provider_id","state")
);

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderOutOfOffice" ADD CONSTRAINT "ProviderOutOfOffice_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSpecialty" ADD CONSTRAINT "ProviderSpecialty_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSpecialty" ADD CONSTRAINT "ProviderSpecialty_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderLicense" ADD CONSTRAINT "ProviderLicense_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consult" ADD CONSTRAINT "Consult_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
