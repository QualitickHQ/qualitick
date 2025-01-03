/*
  Warnings:

  - You are about to drop the column `issueId` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the column `useCaseId` on the `Interaction` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_issueId_fkey";

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_topicId_fkey";

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_useCaseId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "projectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "issueId",
DROP COLUMN "topicId",
DROP COLUMN "useCaseId";

-- CreateTable
CREATE TABLE "InteractionTopic" (
    "interactionId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "InteractionTopic_pkey" PRIMARY KEY ("interactionId","topicId")
);

-- CreateTable
CREATE TABLE "InteractionUseCase" (
    "interactionId" TEXT NOT NULL,
    "useCaseId" TEXT NOT NULL,

    CONSTRAINT "InteractionUseCase_pkey" PRIMARY KEY ("interactionId","useCaseId")
);

-- CreateTable
CREATE TABLE "InteractionIssue" (
    "interactionId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,

    CONSTRAINT "InteractionIssue_pkey" PRIMARY KEY ("interactionId","issueId")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionTopic" ADD CONSTRAINT "InteractionTopic_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "Interaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionTopic" ADD CONSTRAINT "InteractionTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionUseCase" ADD CONSTRAINT "InteractionUseCase_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "Interaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionUseCase" ADD CONSTRAINT "InteractionUseCase_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionIssue" ADD CONSTRAINT "InteractionIssue_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "Interaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionIssue" ADD CONSTRAINT "InteractionIssue_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
