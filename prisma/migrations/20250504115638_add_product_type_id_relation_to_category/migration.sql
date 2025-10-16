-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "productTypeId" TEXT NOT NULL DEFAULT '483f271e-76d9-4d66-9345-6e244dd8a0b7';

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
