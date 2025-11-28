/*
  Warnings:

  - You are about to drop the `FrequentlyAskedQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "FrequentlyAskedQuestion";

-- CreateTable
CREATE TABLE "faq_topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frequently_asked_question" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "topicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frequently_asked_question_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "frequently_asked_question" ADD CONSTRAINT "frequently_asked_question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "faq_topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
