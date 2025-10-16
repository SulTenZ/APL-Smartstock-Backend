-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "stockBatchId" TEXT;

-- CreateTable
CREATE TABLE "StockBatch" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "totalHarga" DOUBLE PRECISION NOT NULL,
    "jumlahSepatu" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockBatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_stockBatchId_fkey" FOREIGN KEY ("stockBatchId") REFERENCES "StockBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
