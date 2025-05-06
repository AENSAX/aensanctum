/*
  Warnings:

  - You are about to drop the column `albumId` on the `Picture` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Picture" DROP CONSTRAINT "Picture_albumId_fkey";

-- AlterTable
ALTER TABLE "Picture" DROP COLUMN "albumId";

-- CreateTable
CREATE TABLE "_AlbumPictures" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AlbumPictures_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AlbumPictures_B_index" ON "_AlbumPictures"("B");

-- AddForeignKey
ALTER TABLE "_AlbumPictures" ADD CONSTRAINT "_AlbumPictures_A_fkey" FOREIGN KEY ("A") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumPictures" ADD CONSTRAINT "_AlbumPictures_B_fkey" FOREIGN KEY ("B") REFERENCES "Picture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
