/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "clients_phoneNumber_key" ON "clients"("phoneNumber");
