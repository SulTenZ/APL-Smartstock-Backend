// repositories/productTypeRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Mendapatkan semua tipe produk
 * @param {Object} params - Parameter query
 * @returns {Promise<Array>} Array tipe produk
 */
export const getAllProductTypes = async (params = {}) => {
  const { search, limit, page } = params;
  const take = limit ? parseInt(limit) : undefined;
  const skip =
    page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined;

  const where = {};
  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [data, total] = await Promise.all([
    prisma.productType.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
            sizes: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take,
      skip,
    }),
    prisma.productType.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : total,
      totalPages: limit ? Math.ceil(total / parseInt(limit)) : 1,
    },
  };
};

/**
 * Mendapatkan tipe produk berdasarkan ID
 * @param {string} id - ID tipe produk
 * @returns {Promise<Object>} Tipe produk
 */
export const getProductTypeById = async (id) => {
  return prisma.productType.findUnique({
    where: { id },
    include: {
      products: true,
      sizes: true,
      _count: {
        select: {
          products: true,
          sizes: true,
        },
      },
    },
  });
};

/**
 * Membuat tipe produk baru
 * @param {Object} data - Data tipe produk
 * @returns {Promise<Object>} Tipe produk yang dibuat
 */
export const createProductType = async (data) => {
  return prisma.productType.create({
    data,
  });
};

/**
 * Memperbarui tipe produk
 * @param {string} id - ID tipe produk
 * @param {Object} data - Data yang diperbarui
 * @returns {Promise<Object>} Tipe produk yang diperbarui
 */
export const updateProductType = async (id, data) => {
  return prisma.productType.update({
    where: { id },
    data,
  });
};

/**
 * Menghapus tipe produk
 * @param {string} id - ID tipe produk
 * @returns {Promise<Object>} Tipe produk yang dihapus
 */
export const deleteProductType = async (id) => {
  return prisma.productType.delete({
    where: { id },
  });
};

/**
 * Memeriksa apakah nama tipe produk sudah ada
 * @param {string} name - Nama tipe produk
 * @param {string} excludeId - ID tipe produk yang dikecualikan (untuk update)
 * @returns {Promise<boolean>} true jika nama sudah ada
 */
export const isProductTypeNameExists = async (name, excludeId = null) => {
  const where = { name };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const count = await prisma.productType.count({ where });
  return count > 0;
};
