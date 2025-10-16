/*
  Warnings:

  - Added the required column `profit` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "profit" DOUBLE PRECISION NOT NULL;
