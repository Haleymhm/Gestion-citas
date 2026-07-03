-- ClinicSetting
CREATE TABLE "ClinicSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" INTEGER,

    CONSTRAINT "ClinicSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClinicSetting_key_key" ON "ClinicSetting"("key");
CREATE INDEX "ClinicSetting_key_idx" ON "ClinicSetting"("key");

ALTER TABLE "ClinicSetting" ADD CONSTRAINT "ClinicSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ClinicHoliday
CREATE TABLE "ClinicHoliday" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "label" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicHoliday_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClinicHoliday_date_key" ON "ClinicHoliday"("date");
CREATE INDEX "ClinicHoliday_date_idx" ON "ClinicHoliday"("date");

ALTER TABLE "ClinicHoliday" ADD CONSTRAINT "ClinicHoliday_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
