-- DropForeignKey
ALTER TABLE "Picture" DROP CONSTRAINT "Picture_albumId_fkey";

-- AddForeignKey
ALTER TABLE "Picture" ADD CONSTRAINT "Picture_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
