-- CreateTable
CREATE TABLE "Search" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "searchQuery" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);
