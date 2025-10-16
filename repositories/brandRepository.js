// repositories/brandRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllBrands = async ({ search, limit, page }) => {
  const take = limit ? parseInt(limit) : undefined;
  const skip = page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined;

  const where = search ? { nama: { contains: search, mode: "insensitive" } } : {};

  const [data, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      orderBy: { nama: "asc" },
      include: { _count: { select: { products: true } } },
      take,
      skip,
    }),
    prisma.brand.count({ where }),
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

export const getBrandById = async (id) => {
  return prisma.brand.findUnique({
    where: { id: parseInt(id) },
    include: {
      products: true,
      _count: { select: { products: true } },
    },
  });
};

export const createBrand = async (data) => {
  return prisma.brand.create({ data });
};

export const updateBrand = async (id, data) => {
  return prisma.brand.update({
    where: { id: parseInt(id) },
    data,
  });
};

export const deleteBrand = async (id) => {
  return prisma.brand.delete({ where: { id: parseInt(id) } });
};

export const isBrandNameExists = async (nama, excludeId = null) => {
  const where = excludeId
    ? { nama, NOT: { id: parseInt(excludeId) } }
    : { nama };
  const count = await prisma.brand.count({ where });
  return count > 0;
};
