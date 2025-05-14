/*
  Warnings:

  - Added the required column `thumbnailUrl` to the `Picture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Picture" ADD COLUMN     "thumbnailUrl" TEXT;

-- 更新现有记录，使用原图URL作为缩略图URL
UPDATE "Picture" SET "thumbnailUrl" = url;

-- 将列设置为必填
ALTER TABLE "Picture" ALTER COLUMN "thumbnailUrl" SET NOT NULL;
