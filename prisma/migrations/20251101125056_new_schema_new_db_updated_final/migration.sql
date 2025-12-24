/*
  Warnings:

  - You are about to drop the column `provider_speciality_id` on the `ProviderLicense` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider_specialty_id,state]` on the table `ProviderLicense` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider_specialty_id` to the `ProviderLicense` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ProviderLicense" DROP CONSTRAINT "ProviderLicense_provider_speciality_id_fkey";

-- DropIndex
DROP INDEX "public"."ProviderLicense_provider_id_state_key";

-- AlterTable
ALTER TABLE "ProviderLicense" DROP COLUMN "provider_speciality_id",
ADD COLUMN     "provider_specialty_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProviderLicense_provider_specialty_id_state_key" ON "ProviderLicense"("provider_specialty_id", "state");

-- AddForeignKey
ALTER TABLE "ProviderLicense" ADD CONSTRAINT "ProviderLicense_provider_specialty_id_fkey" FOREIGN KEY ("provider_specialty_id") REFERENCES "ProviderSpecialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
