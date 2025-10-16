// repositories/categoryRepositories.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllCategories = async ({ search, limit, page }) => {
  const take = limit ? parseInt(limit) : undefined;
  const skip = page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined;

  const where = {};
  if (search) {
    where.nama = { contains: search, mode: "insensitive" };
  }

  const [data, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { nama: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
      take,
      skip,
    }),
    prisma.category.count({ where }),
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

export const getCategoryById = async (id) => {
  return prisma.category.findUnique({
    where: { id: parseInt(id) },
    include: {
      products: true,
      _count: { select: { products: true } },
    },
  });
};

export const createCategory = async (data) => {
  return prisma.category.create({
    data,
    include: { productType: true, _count: { select: { products: true } } },
  });
};

export const updateCategory = async (id, data) => {
  return prisma.category.update({
    where: { id: parseInt(id) },
    data,
    include: { productType: true, _count: { select: { products: true } } },
  });
};

export const deleteCategory = async (id) => {
  return prisma.category.delete({ where: { id: parseInt(id) } });
};

export const isCategoryNameExists = async (nama, excludeId = null) => {
  const where = excludeId
    ? { nama, NOT: { id: parseInt(excludeId) } }
    : { nama };

  const count = await prisma.category.count({ where });
  return count > 0;
};
