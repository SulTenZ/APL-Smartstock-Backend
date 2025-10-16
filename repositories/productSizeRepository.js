import { PrismaClient } from "@prisma/client";
// 1. IMPORT YANG SEBELUMNYA HILANG ADA DI SINI
import * as auditLogRepository from "./auditLogRepository.js";

const prisma = new PrismaClient();

// Fungsi untuk mendapatkan semua kombinasi produk-ukuran
export const getAllProductSizes = async () => {
  return prisma.productSize.findMany({
    include: {
      product: {
        select: {
          id: true,
          nama: true,
          image: true,
          hargaJual: true,
        },
      },
      size: true,
    },
  });
};

// Fungsi untuk mendapatkan detail kombinasi produk-ukuran berdasarkan ID
export const getProductSizeById = async (id) => {
  return prisma.productSize.findUnique({
    where: { id },
    include: {
      product: {
        select: {
          id: true,
          nama: true,
          image: true,
          hargaJual: true,
        },
      },
      size: true,
    },
  });
};

// Fungsi untuk memeriksa apakah kombinasi produk-ukuran sudah ada
export const isProductSizeExists = async (productId, sizeId) => {
  const exists = await prisma.productSize.findFirst({
    where: {
      productId,
      sizeId,
    },
  });
  return !!exists;
};

// Fungsi untuk mendapatkan stok berdasarkan produk dan ukuran
export const getProductSizeStock = async (productId, sizeId) => {
  return prisma.productSize.findFirst({
    where: {
      productId,
      sizeId,
    },
    include: {
      size: true,
    },
  });
};

// Fungsi untuk membuat kombinasi produk-ukuran baru
export const createProductSize = async (data, userId) => {
  const { productId, sizeId, quantity } = data;
  return prisma.$transaction(async (tx) => {
    const productSize = await tx.productSize.create({
      data: { productId, sizeId, quantity },
      include: {
        product: { select: { id: true, nama: true } },
        size: true,
      },
    });
    await updateProductTotalStock(tx, productId);
    if (userId) {
      await auditLogRepository.createLog({
        userId,
        action: "CREATE",
        entity: "ProductSize",
        entityId: productSize.id,
        changes: {
          before: { quantity: 0 },
          after: { quantity: quantity },
          details: `Menambah ukuran '${productSize.size.label}' ke produk '${productSize.product.nama}'`,
        },
      });
    }
    return productSize;
  });
};

// Fungsi untuk mengupdate kombinasi produk-ukuran
export const updateProductSize = async (id, data, userId) => {
  const { quantity } = data;
  return prisma.$transaction(async (tx) => {
    const oldProductSize = await tx.productSize.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, nama: true } },
        size: true,
      },
    });
    if (!oldProductSize) throw new Error("ProductSize tidak ditemukan.");
    const updated = await tx.productSize.update({
      where: { id },
      data: { quantity },
    });
    await updateProductTotalStock(tx, oldProductSize.productId);
    
    // 2. KODE DI BAWAH INI MEMANGGIL IMPORT DI ATAS
    if (userId && oldProductSize.quantity !== quantity) {
      await auditLogRepository.createLog({
        userId,
        action: "UPDATE",
        entity: "ProductSize",
        entityId: id,
        changes: {
          before: { quantity: oldProductSize.quantity },
          after: { quantity: quantity },
          details: `Stok produk '${oldProductSize.product.nama}' ukuran '${oldProductSize.size.label}' diubah`,
        },
      });
    }
    return updated;
  });
};

// Fungsi untuk menghapus kombinasi produk-ukuran
export const deleteProductSize = async (id, userId) => {
  return prisma.$transaction(async (tx) => {
    const oldProductSize = await tx.productSize.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, nama: true } },
        size: true,
      },
    });
    if (!oldProductSize) throw new Error("ProductSize tidak ditemukan.");
    await tx.productSize.delete({ where: { id } });
    await updateProductTotalStock(tx, oldProductSize.productId);
    if (userId) {
      await auditLogRepository.createLog({
        userId,
        action: "DELETE",
        entity: "ProductSize",
        entityId: id,
        changes: {
          before: { quantity: oldProductSize.quantity },
          after: { quantity: 0 },
          details: `Ukuran '${oldProductSize.size.label}' dihapus dari produk '${oldProductSize.product.nama}'`,
        },
      });
    }
  });
};

// Fungsi untuk mengupdate stok setelah transaksi
export const updateStockAfterTransaction = async (
  items,
  isCreate = true,
  userId
) => {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const { productId, sizeId, quantity } = item;
      const productSize = await tx.productSize.findFirst({
        where: { productId, sizeId },
        include: { product: true, size: true },
      });
      if (!productSize) {
        throw new Error(
          `Kombinasi produk-ukuran tidak ditemukan: ${productId} - ${sizeId}`
        );
      }
      const oldQuantity = productSize.quantity;
      const newQuantity = isCreate
        ? oldQuantity - quantity
        : oldQuantity + quantity;
      if (newQuantity < 0) {
        throw new Error("Stok tidak mencukupi");
      }
      await tx.productSize.update({
        where: { id: productSize.id },
        data: { quantity: newQuantity },
      });
      await updateProductTotalStock(tx, productId);
      if (userId) {
        const actionDetail = isCreate ? "Penjualan" : "Pembatalan Penjualan";
        await auditLogRepository.createLog({
          userId,
          action: "UPDATE",
          entity: "ProductSize",
          entityId: productSize.id,
          changes: {
            before: { quantity: oldQuantity },
            after: { quantity: newQuantity },
            details: `${actionDetail} produk '${productSize.product.nama}' ukuran '${productSize.size.label}'`,
          },
        });
      }
    }
  });
};

// Fungsi untuk menyinkronkan stok produk dengan jumlah semua quantity pada ProductSize
export const updateProductTotalStock = async (tx, productId) => {
  const result = await tx.productSize.aggregate({
    where: {
      productId,
    },
    _sum: {
      quantity: true,
    },
  });
  const totalStock = result._sum.quantity || 0;
  await tx.product.update({
    where: { id: productId },
    data: { stock: totalStock },
  });
  return totalStock;
};

// Fungsi untuk menyinkronkan semua stok produk (dapat digunakan untuk perbaikan data)
export const syncAllProductStocks = async () => {
  const products = await prisma.product.findMany({
    select: {
      id: true,
    },
  });
  for (const product of products) {
    await updateProductTotalStock(prisma, product.id);
  }
  return { success: true, count: products.length };
};