// repositories/productRepository.js
import prisma from "../config/prisma.js"; // <--- PENTING: Gunakan import ini, JANGAN new PrismaClient()
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

  // Tambahkan filter tambahan jika tersedia
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


// Fungsi untuk mendapatkan produk berdasarkan ID
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

// Fungsi untuk membuat produk baru
export const createProduct = async (data) => {
  const { sizes = [], ...productData } = data;

  return prisma.$transaction(async (tx) => {
    // Buat produk baru dengan stock awal 0
    const product = await tx.product.create({
      data: {
        ...productData,
        stock: 0, // Stok awal 0, akan dihitung dari quantity sizes
      },
      include: {
        category: true,
        brand: true,
        productType: true,
        stockBatch: true,
      },
    });

    // Tambahkan ukuran dan stok untuk produk
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

      // Update total stok pada produk
      await updateProductTotalStock(tx, product.id);
    }

    // Ambil produk lengkap dengan ukuran
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
  });
};

// Fungsi untuk mengupdate produk
export const updateProduct = async (id, data) => {
  const { sizes, ...productData } = data;

  return prisma.$transaction(async (tx) => {
    // Update data produk
    await tx.product.update({
      where: { id },
      data: productData,
    });

    // Jika sizes disediakan, update stok ukuran
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

    // Update total stok pada produk
    await updateProductTotalStock(tx, id);

    // Ambil produk lengkap
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
  });
};

// Fungsi untuk menghapus produk
export const deleteProduct = async (id) => {
  return prisma.$transaction(async (tx) => {
    // Hapus semua ProductSize terkait
    await tx.productSize.deleteMany({
      where: { productId: id },
    });

    // Hapus produk
    return tx.product.delete({
      where: { id },
    });
  });
};

// Fungsi untuk mendapatkan produk dengan stok rendah
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

// Fungsi untuk mengupdate stok produk langsung
export const updateProductStock = async (id, stock) => {
  return prisma.product.update({
    where: { id },
    data: { stock: parseInt(stock) },
  });
};