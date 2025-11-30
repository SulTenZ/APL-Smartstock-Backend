// repositories/productRepository.js
import prisma from "../config/prisma.js";
import { updateProductTotalStock } from "./productSizeRepository.js";

// Fungsi untuk memeriksa apakah nama produk sudah ada
export const isProductNameExists = async (nama, excludeId = null) => {
  const whereClause = { nama };
  if (excludeId) {
    whereClause.NOT = { id: excludeId };
  }
  const product = await prisma.product.findFirst({ where: whereClause });
  return !!product;
};

// Fungsi untuk mendapatkan semua produk dengan pagination dan pencarian
export const getAllProducts = async ({ search = "", limit = 10, page = 1, brandId, categoryId, productTypeId }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const whereClause = {};

  if (search) {
    whereClause.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { deskripsi: { contains: search, mode: "insensitive" } },
      { brand: { nama: { contains: search, mode: "insensitive" } } },
      { category: { nama: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (brandId) whereClause.brandId = parseInt(brandId);
  if (categoryId) whereClause.categoryId = parseInt(categoryId);
  if (productTypeId) whereClause.productTypeId = productTypeId;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        brand: true,
        productType: true,
        sizes: {
          include: {
            size: true,
          },
        },
        stockBatch: true,
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where: whereClause }),
  ]);

  return {
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalItems: total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getProductById = async (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      productType: true,
      sizes: {
        include: {
          size: true,
        },
      },
      stockBatch: true,
    },
  });
};

// --- FUNGSI CREATE PRODUCT (YANG DIPERBAIKI TIMEOUT-NYA) ---
export const createProduct = async (data) => {
  const { sizes = [], ...productData } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Buat produk baru
    const product = await tx.product.create({
      data: {
        ...productData,
        stock: 0,
      },
      include: {
        category: true,
        brand: true,
        productType: true,
        stockBatch: true,
      },
    });

    // 2. Tambahkan ukuran
    if (sizes.length > 0) {
      for (const size of sizes) {
        await tx.productSize.create({
          data: {
            productId: product.id,
            sizeId: size.sizeId,
            quantity: parseInt(size.quantity) || 0,
          },
        });
      }
      // 3. Update total stok
      await updateProductTotalStock(tx, product.id);
    }

    // 4. Return data final
    return tx.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        brand: true,
        productType: true,
        sizes: {
          include: {
            size: true,
          },
        },
        stockBatch: true,
      },
    });
  }, {
    maxWait: 5000, // Waktu tunggu maksimal untuk dapat koneksi
    timeout: 20000, // <--- PERBAIKAN: Timeout dinaikkan jadi 20 detik
  });
};

// --- FUNGSI UPDATE PRODUCT (JUGA PERLU TIMEOUT) ---
export const updateProduct = async (id, data) => {
  const { sizes, ...productData } = data;

  return prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: productData,
    });

    if (sizes) {
      await tx.productSize.deleteMany({
        where: { productId: id },
      });

      for (const size of sizes) {
        await tx.productSize.create({
          data: {
            productId: id,
            sizeId: size.sizeId,
            quantity: parseInt(size.quantity) || 0,
          },
        });
      }
    }

    await updateProductTotalStock(tx, id);

    return tx.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        productType: true,
        sizes: {
          include: {
            size: true,
          },
        },
        stockBatch: true,
      },
    });
  }, {
    maxWait: 5000,
    timeout: 20000, // <--- Set juga di sini untuk jaga-jaga
  });
};

export const deleteProduct = async (id) => {
  return prisma.$transaction(async (tx) => {
    await tx.productSize.deleteMany({
      where: { productId: id },
    });

    return tx.product.delete({
      where: { id },
    });
  }, {
    timeout: 10000, // Delete biasanya cepat, tapi kita kasih 10s
  });
};

export const getLowStockProducts = async () => {
  return prisma.product.findMany({
    where: {
      stock: {
        lte: prisma.product.fields.minStock,
      },
    },
    include: {
      category: true,
      brand: true,
      sizes: {
        include: {
          size: true,
        },
      },
    },
  });
};

export const updateProductStock = async (id, stock) => {
  return prisma.product.update({
    where: { id },
    data: { stock: parseInt(stock) },
  });
};