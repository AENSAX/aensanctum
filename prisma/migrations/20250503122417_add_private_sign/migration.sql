-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Picture" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;
