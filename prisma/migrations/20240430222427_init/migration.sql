/*
  Warnings:

  - You are about to drop the `Search` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Search";

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "searchQuery" VARCHAR(255) NOT NULL,
    "content" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);
