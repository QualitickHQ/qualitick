/*
  Warnings:

  - A unique constraint covering the columns `[apiKey]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - The required column `apiKey` was added to the `Project` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "apiKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_apiKey_key" ON "Project"("apiKey");
