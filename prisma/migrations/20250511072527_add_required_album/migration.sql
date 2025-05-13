/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Picture` table. All the data in the column will be lost.
  - You are about to drop the column `isPrivate` on the `Picture` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Picture` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Picture` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Picture` table. All the data in the column will be lost.
  - You are about to drop the `AlbumPicture` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `albumId` to the `Picture` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AlbumPicture" DROP CONSTRAINT "AlbumPicture_albumId_fkey";

-- DropForeignKey
ALTER TABLE "AlbumPicture" DROP CONSTRAINT "AlbumPicture_pictureId_fkey";

-- DropForeignKey
ALTER TABLE "Picture" DROP CONSTRAINT "Picture_ownerId_fkey";

-- AlterTable
ALTER TABLE "Picture" DROP COLUMN "createdAt",
DROP COLUMN "isPrivate",
DROP COLUMN "ownerId",
DROP COLUMN "tags",
DROP COLUMN "title",
ADD COLUMN     "albumId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "AlbumPicture";

-- AddForeignKey
ALTER TABLE "Picture" ADD CONSTRAINT "Picture_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
