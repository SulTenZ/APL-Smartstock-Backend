/*
  Warnings:

  - Added the required column `isResetPasswordVerified` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "deskripsi" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isResetPasswordVerified" BOOLEAN NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationOtp" TEXT,
ADD COLUMN     "verificationOtpCreatedAt" TIMESTAMP(3);
