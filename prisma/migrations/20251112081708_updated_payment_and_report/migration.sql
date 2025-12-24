/*
  Warnings:

  - You are about to drop the column `stripe_checkout_session_id` on the `Payment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('ISDRAFT', 'COMPLETED');

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "stripe_checkout_session_id";

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "report_status" "ReportStatus" NOT NULL DEFAULT 'ISDRAFT';
