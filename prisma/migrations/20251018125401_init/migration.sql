-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'PHYSICIAN');

-- CreateEnum
CREATE TYPE "ConsultStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'ANSWERED', 'DECLINED', 'AUTO_DECLINED');

-- CreateEnum
CREATE TYPE "USState" AS ENUM ('Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'District of Columbia', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming');

-- CreateEnum
CREATE TYPE "Pronoun" AS ENUM ('HE_HIM', 'SHE_HER', 'THEY_THEM');

-- CreateEnum
CREATE TYPE "SexAtBirth" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Topic" AS ENUM ('DRY_EYE_SYMPTOMS', 'RED_OR_IRRITATED_EYE', 'STYE_OR_EYELID_BUMP', 'EYELID_LESION_OR_GROWTH', 'OTHER_EYE_CONCERN');

-- CreateEnum
CREATE TYPE "EyeHistory" AS ENUM ('NONE', 'CONTACT_LENSES', 'RECENT_EYE_SURGERY_LT_90D', 'GLAUCOMA', 'LASIK_PRK', 'UVEITIS');

-- CreateEnum
CREATE TYPE "Systemic" AS ENUM ('NONE', 'DIABETIC', 'AUTOIMMUNE_SJOGRENS', 'THYROID');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicianProfile" (
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "price_cents" DECIMAL(10,2),
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "daily_cap" INTEGER,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "PhysicianProfile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "PhysicianOutOfOffice" (
    "id" TEXT NOT NULL,
    "physician_id" TEXT NOT NULL,
    "ooo_start" TIMESTAMP(3) NOT NULL,
    "ooo_end" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "PhysicianOutOfOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicianSpecialty" (
    "physician_id" TEXT NOT NULL,
    "specialty_id" TEXT NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "PhysicianSpecialty_pkey" PRIMARY KEY ("physician_id","specialty_id")
);

-- CreateTable
CREATE TABLE "PhysicianLicensure" (
    "physician_id" TEXT NOT NULL,
    "state" "USState" NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "PhysicianLicensure_pkey" PRIMARY KEY ("physician_id","state")
);

-- CreateTable
CREATE TABLE "Consult" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "physician_id" TEXT NOT NULL,
    "state_at_service" TEXT,
    "coverage_is_attested" BOOLEAN NOT NULL DEFAULT false,
    "has_red_flag" BOOLEAN NOT NULL DEFAULT false,
    "question_body" TEXT NOT NULL,
    "medications" TEXT,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "pronoun" "Pronoun",
    "sex_at_birth" "SexAtBirth",
    "pain" INTEGER NOT NULL,
    "blur" INTEGER NOT NULL,
    "light_sensitivity" INTEGER NOT NULL,
    "redness" INTEGER NOT NULL,
    "status" "ConsultStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submitted_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_date" TIMESTAMP(3),
    "answered_date" TIMESTAMP(3),
    "declined_date" TIMESTAMP(3),
    "auto_declined_date" TIMESTAMP(3),
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "Consult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultTopic" (
    "consult_id" TEXT NOT NULL,
    "topic" "Topic" NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "ConsultTopic_pkey" PRIMARY KEY ("consult_id","topic")
);

-- CreateTable
CREATE TABLE "ConsultEyeHistory" (
    "consult_id" TEXT NOT NULL,
    "eye_history" "EyeHistory" NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "ConsultEyeHistory_pkey" PRIMARY KEY ("consult_id","eye_history")
);

-- CreateTable
CREATE TABLE "ConsultSystemic" (
    "consult_id" TEXT NOT NULL,
    "systemic" "Systemic" NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "ConsultSystemic_pkey" PRIMARY KEY ("consult_id","systemic")
);

-- CreateTable
CREATE TABLE "Payment" (
    "consult_id" TEXT NOT NULL,
    "stripe_checkout_session_id" TEXT NOT NULL,
    "payment_intent_id" TEXT NOT NULL,
    "amount_cents" DECIMAL(10,2),
    "preauth_date" TIMESTAMP(3),
    "captured_date" TIMESTAMP(3),
    "refunded_date" TIMESTAMP(3),
    "refund_reason" TEXT,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("consult_id")
);

-- CreateTable
CREATE TABLE "Report" (
    "consult_id" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "differentials_general" TEXT NOT NULL,
    "self_care_general" TEXT NOT NULL,
    "when_to_seek_care" TEXT NOT NULL,
    "signed_by" TEXT,
    "signed_date" TIMESTAMP(3),
    "addenda_json" JSONB,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("consult_id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_role" "UserRole" NOT NULL,
    "action" TEXT NOT NULL,
    "object_type" TEXT NOT NULL,
    "object_id" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "metadata_json" JSONB,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_name_key" ON "Specialty"("name");

-- AddForeignKey
ALTER TABLE "PhysicianProfile" ADD CONSTRAINT "PhysicianProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicianOutOfOffice" ADD CONSTRAINT "PhysicianOutOfOffice_physician_id_fkey" FOREIGN KEY ("physician_id") REFERENCES "PhysicianProfile"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicianSpecialty" ADD CONSTRAINT "PhysicianSpecialty_physician_id_fkey" FOREIGN KEY ("physician_id") REFERENCES "PhysicianProfile"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicianSpecialty" ADD CONSTRAINT "PhysicianSpecialty_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicianLicensure" ADD CONSTRAINT "PhysicianLicensure_physician_id_fkey" FOREIGN KEY ("physician_id") REFERENCES "PhysicianProfile"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consult" ADD CONSTRAINT "Consult_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consult" ADD CONSTRAINT "Consult_physician_id_fkey" FOREIGN KEY ("physician_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultTopic" ADD CONSTRAINT "ConsultTopic_consult_id_fkey" FOREIGN KEY ("consult_id") REFERENCES "Consult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultEyeHistory" ADD CONSTRAINT "ConsultEyeHistory_consult_id_fkey" FOREIGN KEY ("consult_id") REFERENCES "Consult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultSystemic" ADD CONSTRAINT "ConsultSystemic_consult_id_fkey" FOREIGN KEY ("consult_id") REFERENCES "Consult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_consult_id_fkey" FOREIGN KEY ("consult_id") REFERENCES "Consult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_consult_id_fkey" FOREIGN KEY ("consult_id") REFERENCES "Consult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
