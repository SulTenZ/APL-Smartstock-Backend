// repositories/customerRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const findAll = async () => {
  return await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const findById = async (id) => {
  return await prisma.customer.findUnique({
    where: { id },
  });
};

export const create = async (data) => {
  return await prisma.customer.create({ data });
};

export const update = async (id, data) => {
  return await prisma.customer.update({
    where: { id },
    data,
  });
};

export const remove = async (id) => {
  return await prisma.customer.delete({
    where: { id },
  });
};