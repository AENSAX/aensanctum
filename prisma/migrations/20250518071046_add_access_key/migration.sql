/*
  Warnings:

  - A unique constraint covering the columns `[accessKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_accessKey_key" ON "User"("accessKey");
