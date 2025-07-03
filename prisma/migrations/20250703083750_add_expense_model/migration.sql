/*
  Warnings:

  - You are about to drop the `InspectionResult` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `InspectionChecklist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `checklistId` to the `Inspection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `results` to the `Inspection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `items` to the `InspectionChecklist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InspectionResult" DROP CONSTRAINT "InspectionResult_checklistId_fkey";

-- DropForeignKey
ALTER TABLE "InspectionResult" DROP CONSTRAINT "InspectionResult_inspectionId_fkey";

-- AlterTable
ALTER TABLE "Inspection" ADD COLUMN     "checklistId" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "results" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "InspectionChecklist" ADD COLUMN     "items" JSONB NOT NULL;

-- DropTable
DROP TABLE "InspectionResult";

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InspectionChecklist_name_key" ON "InspectionChecklist"("name");

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "InspectionChecklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
