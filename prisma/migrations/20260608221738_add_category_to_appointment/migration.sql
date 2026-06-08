-- CreateEnum
CREATE TYPE "AppointmentCategory" AS ENUM ('EMERGENCY', 'VETERINARY', 'GROOMING', 'VACCINATION', 'SURGERY', 'LABORATORY', 'OTHER');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "category" "AppointmentCategory" NOT NULL DEFAULT 'VETERINARY';
