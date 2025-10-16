// repositories/sizeRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllSizes = async ({ search, limit, page, productTypeId }) => {
  const take = limit ? parseInt(limit) : undefined;
  const skip = page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined;

  const where = {};
  if (search) where.label = { contains: search, mode: "insensitive" };
  if (productTypeId) where.productTypeId = productTypeId;

  const [data, total] = await Promise.all([
    prisma.size.findMany({ where, take, skip, orderBy: { label: "asc" }, include: { _count: true, productType: true, } }),
    prisma.size.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: page ? parseInt(page) : 1,
      limit: take || total,
      totalPages: take ? Math.ceil(total / take) : 1,
    },
  };
};

export const getSizeById = async (id) => {
  return prisma.size.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true } },
      productType: true,
    },
  });
};

export const createSize = async (data) => {
  return prisma.size.create({ data });
};

export const updateSize = async (id, data) => {
  return prisma.size.update({
    where: { id },
    data,
  });
};

export const deleteSize = async (id) => {
  return prisma.size.delete({ where: { id } });
};

export const isSizeLabelExists = async (label, productTypeId, excludeId = null) => {
  const where = {
    label,
    productTypeId,
  };
  if (excludeId) {
    where.id = { not: excludeId };
  }

  const count = await prisma.size.count({ where });
  return count > 0;
};
