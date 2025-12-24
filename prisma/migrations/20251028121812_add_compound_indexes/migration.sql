/*
  Warnings:

  - A unique constraint covering the columns `[provider_id,state]` on the table `ProviderLicense` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider_id,specialty_id]` on the table `ProviderSpecialty` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProviderLicense_provider_id_state_key" ON "ProviderLicense"("provider_id", "state");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderSpecialty_provider_id_specialty_id_key" ON "ProviderSpecialty"("provider_id", "specialty_id");
