/*
  Warnings:

  - You are about to drop the column `alamat` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Customer` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Customer_email_key";

-- DropIndex
DROP INDEX "Customer_email_phone_idx";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "alamat",
DROP COLUMN "email";

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");
