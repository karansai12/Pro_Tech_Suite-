/*
  Warnings:

  - You are about to drop the column `projectName` on the `Project` table. All the data in the column will be lost.
  - Added the required column `projectTitle` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "projectName",
ADD COLUMN     "projectTitle" TEXT NOT NULL;
