/*
  Warnings:

  - A unique constraint covering the columns `[specialty_id,condition_id]` on the table `SpecialtyCondition` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[specialty_id,symptom_id]` on the table `SpecialtySymptom` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SpecialtyCondition_specialty_id_condition_id_key" ON "SpecialtyCondition"("specialty_id", "condition_id");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialtySymptom_specialty_id_symptom_id_key" ON "SpecialtySymptom"("specialty_id", "symptom_id");
