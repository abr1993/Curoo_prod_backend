-- CreateTable
CREATE TABLE "RedFlag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "RedFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialtyRedFlag" (
    "id" TEXT NOT NULL,
    "specialty_id" TEXT NOT NULL,
    "red_flag_id" TEXT NOT NULL,
    "order" INTEGER,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "deleted_date" TIMESTAMP(3),

    CONSTRAINT "SpecialtyRedFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RedFlag_name_key" ON "RedFlag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialtyRedFlag_specialty_id_red_flag_id_key" ON "SpecialtyRedFlag"("specialty_id", "red_flag_id");

-- AddForeignKey
ALTER TABLE "SpecialtyRedFlag" ADD CONSTRAINT "SpecialtyRedFlag_red_flag_id_fkey" FOREIGN KEY ("red_flag_id") REFERENCES "RedFlag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialtyRedFlag" ADD CONSTRAINT "SpecialtyRedFlag_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
