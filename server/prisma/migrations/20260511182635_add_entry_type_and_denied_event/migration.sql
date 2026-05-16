-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('RESERVATION', 'WALKIN');

-- AlterEnum
ALTER TYPE "ParkingEventType" ADD VALUE 'DENIED';

-- AlterTable
ALTER TABLE "ParkingEvent" ADD COLUMN     "entryType" "EntryType";
