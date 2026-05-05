/*
  Warnings:

  - You are about to drop the column `isDefective` on the `ParkingSpot` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `ParkingSpot` table. All the data in the column will be lost.
  - You are about to drop the column `zone` on the `ParkingSpot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ParkingSpot" DROP COLUMN "isDefective",
DROP COLUMN "level",
DROP COLUMN "zone";
