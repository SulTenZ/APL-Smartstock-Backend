/*
  Warnings:

  - Added the required column `brandId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "KondisiProduk" AS ENUM ('BARU', 'BEKAS', 'REKONDISI');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'DIGITAL_WALLET';

-- DropIndex
DROP INDEX "Product_categoryId_productTypeId_idx";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "alamat" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brandId" INTEGER NOT NULL,
ADD COLUMN     "kondisi" "KondisiProduk" NOT NULL DEFAULT 'BARU';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "catatan" TEXT,
ADD COLUMN     "diskon" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TransactionItem" ADD COLUMN     "diskon" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_nama_key" ON "Brand"("nama");

-- CreateIndex
CREATE INDEX "Brand_nama_idx" ON "Brand"("nama");

-- CreateIndex
CREATE INDEX "Product_categoryId_productTypeId_brandId_idx" ON "Product"("categoryId", "productTypeId", "brandId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
