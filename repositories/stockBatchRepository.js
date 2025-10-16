// repositories/stockBatchRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllStockBatches = async () => {
  return prisma.stockBatch.findMany({ orderBy: { createdAt: "desc" } });
};

export const getStockBatchById = async (id) => {
  return prisma.stockBatch.findUnique({ where: { id }, include: { products: true } });
};

export const createStockBatch = async (data) => {
  return prisma.stockBatch.create({ data });
};

export const updateStockBatch = async (id, data) => {
  return prisma.stockBatch.update({ where: { id }, data });
};

export const deleteStockBatch = async (id) => {
  return prisma.stockBatch.delete({ where: { id } });
};