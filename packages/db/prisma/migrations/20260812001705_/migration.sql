-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('INTERVIEW', 'SOLO');

-- AlterTable
ALTER TABLE "room" ADD COLUMN     "roomType" "RoomType" NOT NULL DEFAULT 'INTERVIEW';
