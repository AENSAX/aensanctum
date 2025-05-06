-- DropForeignKey
ALTER TABLE "AlbumPicture" DROP CONSTRAINT "AlbumPicture_albumId_fkey";

-- DropForeignKey
ALTER TABLE "AlbumPicture" DROP CONSTRAINT "AlbumPicture_pictureId_fkey";

-- AddForeignKey
ALTER TABLE "AlbumPicture" ADD CONSTRAINT "AlbumPicture_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumPicture" ADD CONSTRAINT "AlbumPicture_pictureId_fkey" FOREIGN KEY ("pictureId") REFERENCES "Picture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
