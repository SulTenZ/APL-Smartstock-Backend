import prisma from "../config/prisma.js";

/**
 * Mengambil ringkasan keuangan (pendapatan, profit, jumlah transaksi)
 * untuk bulan dan tahun yang ditentukan.
 * @param {number} year - Tahun (misal: 2025)
 * @param {number} month - Bulan (1-12)
 * @returns {Promise<object>}
 */
export const getFinancialSummary = async (year, month) => {
  // Tentukan tanggal awal (hari pertama jam 00:00)
  const startDate = new Date(year, month - 1, 1);
  // Tentukan tanggal akhir (hari terakhir jam 23:59:59)
  const endDate = new Date(year, month, 0, 23, 59, 59);

  console.log(`[Report Repo] Menghitung summary dari ${startDate.toISOString()} sampai ${endDate.toISOString()}`);

  const summary = await prisma.transaction.aggregate({
    // Filter transaksi hanya untuk bulan yang dipilih
    where: {
      createdAt: {
        gte: startDate, // gte: greater than or equal to
        lte: endDate, // lte: less than or equal to
      },
    },

    // Perintahkan Prisma untuk menjumlahkan dan menghitung
    _sum: {
      totalAmount: true, // Jumlahkan semua `totalAmount`
      profit: true,      // Jumlahkan semua `profit`
    },
    _count: {
      id: true,          // Hitung semua transaksi berdasarkan 'id'
    },
  });

  // Format hasil agar rapi dan beri nilai default 0 jika null
  return {
    totalRevenue: summary._sum.totalAmount || 0,
    totalProfit: summary._sum.profit || 0,
    transactionCount: summary._count.id || 0,
    period: {
        month: startDate.toLocaleString('id-ID', { month: 'long' }),
        year: year
    }
  };
};