/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Specialty` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NameVisibilityOption" AS ENUM ('INITIALS_ONLY', 'FULL_NAME', 'ANONYMOUS');

-- AlterEnum
ALTER TYPE "ConsultStatus" ADD VALUE 'ISDRAFT';

-- AlterTable
ALTER TABLE "Consult" ADD COLUMN     "legal_name" TEXT,
ADD COLUMN     "show_name_options" "NameVisibilityOption" NOT NULL DEFAULT 'ANONYMOUS',
ALTER COLUMN "question_body" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PhysicianProfile" ADD COLUMN     "avatar" TEXT;

-- AlterTable
ALTER TABLE "Specialty" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otp_generated_date" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
