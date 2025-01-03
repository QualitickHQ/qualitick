/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identifier` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "identifier" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_identifier_key" ON "Conversation"("identifier");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
