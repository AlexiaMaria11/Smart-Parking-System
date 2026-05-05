/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `HardwareDevice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HardwareDevice_name_key" ON "HardwareDevice"("name");
