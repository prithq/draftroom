-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "room" ADD COLUMN     "questionId" TEXT;

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "pattern" TEXT NOT NULL,
    "tags" TEXT[],
    "starterCode" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_case" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "expected" JSONB NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT true,
    "weight" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "test_case_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_slug_key" ON "question"("slug");

-- CreateIndex
CREATE INDEX "question_difficulty_idx" ON "question"("difficulty");

-- CreateIndex
CREATE INDEX "question_pattern_idx" ON "question"("pattern");

-- AddForeignKey
ALTER TABLE "test_case" ADD CONSTRAINT "test_case_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
