// repositories/auditLogRepository.js
import prisma from "../config/prisma.js";

/**
 * Membuat entri log audit baru.
 * @param {object} logData - Data untuk log audit.
 * @param {number} logData.userId - ID pengguna yang melakukan aksi.
 * @param {('CREATE'|'UPDATE'|'DELETE')} logData.action - Tipe aksi.
 * @param {string} logData.entity - Nama model/tabel yang terpengaruh.
 * @param {string} logData.entityId - ID dari record yang terpengaruh.
 * @param {object} logData.changes - Objek yang berisi { before, after }.
 */
export const createLog = async ({ userId, action, entity, entityId, changes }) => {
  if (!userId || !action || !entity || !entityId) {
    throw new Error("Parameter tidak lengkap untuk membuat log audit.");
  }

  return prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      changes,
      createdAt: new Date(),
    },
  });
};

/**
 * Mengambil data log audit dengan paginasi dan filter.
 * @param {object} options - Opsi untuk query.
 * @param {number} [options.page=1] - Halaman saat ini.
 * @param {number} [options.limit=10] - Jumlah item per halaman.
 * @param {string} [options.productId] - Filter berdasarkan ID produk.
 */
export const getLogs = async ({ page = 1, limit = 10, productId }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const whereClause = {};
  if (productId) {
    whereClause.entity = "ProductSize"; // Asumsi log stok terkait dengan ProductSize
    // Ini bisa diperluas jika ingin melacak perubahan Product juga
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where: whereClause }),
  ]);

  return {
    data: logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalItems: total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};