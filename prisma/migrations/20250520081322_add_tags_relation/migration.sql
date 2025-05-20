/*
  Warnings:

  - You are about to drop the column `tags` on the `Album` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Album" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlbumTag" (
    "albumId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "AlbumTag_pkey" PRIMARY KEY ("albumId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_text_key" ON "Tag"("text");

-- CreateIndex
CREATE INDEX "AlbumTag_tagId_idx" ON "AlbumTag"("tagId");

-- CreateIndex
CREATE INDEX "AlbumTag_albumId_idx" ON "AlbumTag"("albumId");

-- AddForeignKey
ALTER TABLE "AlbumTag" ADD CONSTRAINT "AlbumTag_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumTag" ADD CONSTRAINT "AlbumTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
