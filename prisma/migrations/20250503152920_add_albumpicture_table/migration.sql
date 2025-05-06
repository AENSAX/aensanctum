/*
  Warnings:

  - You are about to drop the `_AlbumPictures` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AlbumPictures" DROP CONSTRAINT "_AlbumPictures_A_fkey";

-- DropForeignKey
ALTER TABLE "_AlbumPictures" DROP CONSTRAINT "_AlbumPictures_B_fkey";

-- DropTable
DROP TABLE "_AlbumPictures";

-- CreateTable
CREATE TABLE "AlbumPicture" (
    "id" SERIAL NOT NULL,
    "albumId" INTEGER NOT NULL,
    "pictureId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AlbumPicture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlbumPicture_albumId_pictureId_key" ON "AlbumPicture"("albumId", "pictureId");

-- AddForeignKey
ALTER TABLE "AlbumPicture" ADD CONSTRAINT "AlbumPicture_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumPicture" ADD CONSTRAINT "AlbumPicture_pictureId_fkey" FOREIGN KEY ("pictureId") REFERENCES "Picture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
