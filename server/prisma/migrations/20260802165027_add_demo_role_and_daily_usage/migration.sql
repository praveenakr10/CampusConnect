-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('API', 'UPLOAD', 'AI');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'DEMO';

-- CreateTable
CREATE TABLE "DailyUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "UsageType" NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyUsage_day_idx" ON "DailyUsage"("day");

-- CreateIndex
CREATE UNIQUE INDEX "DailyUsage_userId_type_day_key" ON "DailyUsage"("userId", "type", "day");

-- AddForeignKey
ALTER TABLE "DailyUsage" ADD CONSTRAINT "DailyUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
