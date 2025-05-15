/*
  Warnings:

  - You are about to drop the column `isActivate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isActivate",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
