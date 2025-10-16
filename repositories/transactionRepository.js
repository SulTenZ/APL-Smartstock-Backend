// repositories/transactionRepository.js
import { PrismaClient } from "@prisma/client";
import { updateStockAfterTransaction } from "./productSizeRepository.js";

const prisma = new PrismaClient();

export const createTransaction = async (transactionData, items) => {
  return prisma.$transaction(async (tx) => {
    // 1. Buat transaksi baru
    const transaction = await tx.transaction.create({
      data: {
        // Menggunakan connect untuk customer jika customerId ada
        ...(transactionData.customerId ? {
          customer: { connect: { id: transactionData.customerId } }
        } : {}),
        // Menggunakan connect untuk user
        ...(transactionData.userId ? {
          processedBy: { connect: { id: transactionData.userId } }
        } : {}),
        totalAmount: transactionData.totalAmount,
        profit: transactionData.profit,
        paymentMethod: transactionData.paymentMethod,
        diskon: transactionData.diskon,
        catatan: transactionData.catatan,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            sizeId: item.sizeId,
            quantity: item.quantity,
            hargaJual: item.hargaJual,
            hargaBeli: item.hargaBeli,
            diskon: item.diskon || 0,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            size: true,
          },
        },
        customer: true,
        processedBy: true,
      },
    });

    // 2. Update stok produk untuk setiap item yang dibeli
    for (const item of items) {
      // Cari ProductSize
      const productSize = await tx.productSize.findFirst({
        where: {
          productId: item.productId,
          sizeId: item.sizeId,
        },
      });

      if (!productSize) {
        throw new Error(
          `Kombinasi produk-ukuran tidak ditemukan: ${item.productId} - ${item.sizeId}`
        );
      }

      // Update stok pada ProductSize
      const newQuantity = productSize.quantity - item.quantity;
      if (newQuantity < 0) {
        throw new Error("Stok tidak mencukupi");
      }

      await tx.productSize.update({
        where: { id: productSize.id },
        data: { quantity: newQuantity },
      });

      // Update total stok pada produk
      const result = await tx.productSize.aggregate({
        where: {
          productId: item.productId,
        },
        _sum: {
          quantity: true,
        },
      });

      const totalStock = result._sum.quantity || 0;
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: totalStock },
      });
    }

    return transaction;
  });
};

export const getAllTransactions = async () => {
  return prisma.transaction.findMany({
    include: {
      items: {
        include: {
          product: true,
          size: true,
        },
      },
      customer: true,
      processedBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getTransactionById = async (id) => {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
          size: true,
        },
      },
      customer: true,
      processedBy: true,
    },
  });
};

export const updateTransaction = async (id, transactionData, newItems = []) => {
  return prisma.$transaction(async (tx) => {
    // 1. Ambil data transaksi yang ada
    const existingTransaction = await tx.transaction.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existingTransaction) {
      throw new Error("Transaksi tidak ditemukan");
    }

    // 2. Kembalikan stok untuk item-item yang ada di transaksi lama
    for (const item of existingTransaction.items) {
      const productSize = await tx.productSize.findFirst({
        where: {
          productId: item.productId,
          sizeId: item.sizeId,
        },
      });

      if (productSize) {
        // Tambahkan kembali stok yang sudah terjual
        await tx.productSize.update({
          where: { id: productSize.id },
          data: { quantity: productSize.quantity + item.quantity },
        });
      }
    }

    // 3. Hapus semua item transaksi yang lama
    await tx.transactionItem.deleteMany({
      where: {
        transactionId: id,
      },
    });

    // 4. Update transaksi dengan data baru
    const updatedTransaction = await tx.transaction.update({
      where: { id },
      data: {
        customerId: transactionData.customerId,
        totalAmount: transactionData.totalAmount,
        profit: transactionData.profit,
        paymentMethod: transactionData.paymentMethod,
        diskon: transactionData.diskon,
        catatan: transactionData.catatan,
        items: {
          create: newItems.map((item) => ({
            productId: item.productId,
            sizeId: item.sizeId,
            quantity: item.quantity,
            hargaJual: item.hargaJual,
            hargaBeli: item.hargaBeli,
            diskon: item.diskon || 0,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            size: true,
          },
        },
        customer: true,
        processedBy: true,
      },
    });

    // 5. Kurangi stok untuk item-item baru
    for (const item of newItems) {
      const productSize = await tx.productSize.findFirst({
        where: {
          productId: item.productId,
          sizeId: item.sizeId,
        },
      });

      if (!productSize) {
        throw new Error(
          `Kombinasi produk-ukuran tidak ditemukan: ${item.productId} - ${item.sizeId}`
        );
      }

      // Update stok pada ProductSize
      const newQuantity = productSize.quantity - item.quantity;
      if (newQuantity < 0) {
        throw new Error(
          `Stok tidak mencukupi untuk produk ${item.productId} ukuran ${item.sizeId}`
        );
      }

      await tx.productSize.update({
        where: { id: productSize.id },
        data: { quantity: newQuantity },
      });
    }

    // 6. Update total stok pada semua produk yang terlibat
    const allProductIds = [
      ...new Set([
        ...existingTransaction.items.map((item) => item.productId),
        ...newItems.map((item) => item.productId),
      ]),
    ];

    for (const productId of allProductIds) {
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
    }

    return updatedTransaction;
  });
};

export const deleteTransaction = async (id) => {
  return prisma.$transaction(async (tx) => {
    // 1. Ambil data transaksi yang akan dihapus
    const transaction = await tx.transaction.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!transaction) {
      throw new Error("Transaksi tidak ditemukan");
    }

    // 2. Kembalikan stok untuk setiap item yang dibeli
    for (const item of transaction.items) {
      const productSize = await tx.productSize.findFirst({
        where: {
          productId: item.productId,
          sizeId: item.sizeId,
        },
      });

      if (productSize) {
        // Tambahkan kembali stok yang sudah terjual
        await tx.productSize.update({
          where: { id: productSize.id },
          data: { quantity: productSize.quantity + item.quantity },
        });

        // Update total stok pada produk
        const result = await tx.productSize.aggregate({
          where: {
            productId: item.productId,
          },
          _sum: {
            quantity: true,
          },
        });

        const totalStock = result._sum.quantity || 0;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: totalStock },
        });
      }
    }

    // 3. Hapus transaksi
    await tx.transactionItem.deleteMany({
      where: {
        transactionId: id,
      },
    });

    return tx.transaction.delete({
      where: { id },
    });
  });
};

export const getTransactionsByDate = async (startDate, endDate) => {
  const dateFilter = {};

  if (startDate) {
    dateFilter.gte = new Date(startDate);
  }

  if (endDate) {
    dateFilter.lte = new Date(endDate);
    // Set waktu akhir hari
    dateFilter.lte.setHours(23, 59, 59, 999);
  }

  const where = {};
  if (startDate || endDate) {
    where.createdAt = dateFilter;
  }

  return prisma.transaction.findMany({
    where,
    include: {
      items: {
        include: {
          product: true,
          size: true,
        },
      },
      customer: true,
      processedBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getProfitReport = async (startDate, endDate) => {
  const dateFilter = {};

  if (startDate) {
    dateFilter.gte = new Date(startDate);
  }

  if (endDate) {
    dateFilter.lte = new Date(endDate);
    // Set waktu akhir hari
    dateFilter.lte.setHours(23, 59, 59, 999);
  }

  const where = {};
  if (startDate || endDate) {
    where.createdAt = dateFilter;
  }

  // Ambil semua transaksi pada periode yang ditentukan
  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      items: true,
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Kalkulasi profit per hari
  const profitByDay = {};
  const revenueByDay = {};
  const costByDay = {};

  for (const transaction of transactions) {
    const date = transaction.createdAt.toISOString().split("T")[0];
    profitByDay[date] = (profitByDay[date] || 0) + transaction.profit;
    revenueByDay[date] = (revenueByDay[date] || 0) + transaction.totalAmount;

    // Hitung total modal per transaksi
    let transactionCost = 0;
    for (const item of transaction.items) {
      transactionCost += item.hargaBeli * item.quantity;
    }

    costByDay[date] = (costByDay[date] || 0) + transactionCost;
  }

  // Kalkulasi profit per produk
  const productSales = await prisma.transactionItem.groupBy({
    by: ["productId"],
    where: {
      transaction: {
        createdAt: dateFilter,
      },
    },
    _sum: {
      quantity: true,
      hargaJual: true,
      hargaBeli: true,
    },
  });

  // Ambil nama produk dan hitung profit
  const productProfit = [];
  for (const product of productSales) {
    const productDetail = await prisma.product.findUnique({
      where: { id: product.productId },
      select: { nama: true, brand: { select: { nama: true } } },
    });

    const revenue = product._sum.hargaJual;
    const cost = product._sum.hargaBeli;
    const profit = revenue - cost;

    productProfit.push({
      productId: product.productId,
      productName: productDetail?.nama || "Produk Tidak Ditemukan",
      brandName: productDetail?.brand?.nama || "Brand Tidak Ditemukan",
      quantitySold: product._sum.quantity,
      revenue: revenue,
      cost: cost,
      profit: profit,
    });
  }

  // Urutkan berdasarkan profit tertinggi
  productProfit.sort((a, b) => b.profit - a.profit);

  // Kalkulasi profit per brand
  const brandProfit = {};
  for (const item of productProfit) {
    if (!brandProfit[item.brandName]) {
      brandProfit[item.brandName] = {
        quantitySold: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
      };
    }

    brandProfit[item.brandName].quantitySold += item.quantitySold;
    brandProfit[item.brandName].revenue += item.revenue;
    brandProfit[item.brandName].cost += item.cost;
    brandProfit[item.brandName].profit += item.profit;
  }

  // Kalkulasi total
  const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalProfit = transactions.reduce((sum, t) => sum + t.profit, 0);
  const totalCost = Object.values(costByDay).reduce(
    (sum, cost) => sum + cost,
    0
  );

  return {
    summary: {
      totalTransactions: transactions.length,
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    },
    profitByDay,
    revenueByDay,
    costByDay,
    topProducts: productProfit.slice(0, 10),
    brandPerformance: Object.entries(brandProfit).map(([brand, data]) => ({
      brand,
      ...data,
      profitMargin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
    })),
  };
};
