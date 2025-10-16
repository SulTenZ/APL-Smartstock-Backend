// repositories/transactionItemRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Mendapatkan semua item transaksi
 */
export const getAllTransactionItems = async () => {
  return prisma.transactionItem.findMany({
    include: {
      product: {
        include: {
          brand: true,
          category: true,
        },
      },
      size: true,
      transaction: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Mendapatkan item transaksi berdasarkan ID
 */
export const getTransactionItemById = async (id) => {
  return prisma.transactionItem.findUnique({
    where: { id },
    include: {
      product: {
        include: {
          brand: true,
          category: true,
        },
      },
      size: true,
      transaction: true,
    },
  });
};

/**
 * Mendapatkan semua item transaksi berdasarkan ID transaksi
 */
export const getItemsByTransactionId = async (transactionId) => {
  return prisma.transactionItem.findMany({
    where: { transactionId },
    include: {
      product: {
        include: {
          brand: true,
          category: true,
        },
      },
      size: true,
    },
  });
};
