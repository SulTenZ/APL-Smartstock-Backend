// controllers/transactionController.js
import { validationResult } from "express-validator";
import * as transactionRepo from "../repositories/transactionRepository.js";
import { getProductSizeStock } from "../repositories/productSizeRepository.js";
import { getProductById } from "../repositories/productRepository.js";

export const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { items, diskon = 0, ...transactionData } = req.body;
    const userId = req.user.id;

    // Validate stock and get product prices
    const itemsWithPrices = [];
    let subtotal = 0;
    let totalItemsProfit = 0;

    // Validasi stok terlebih dahulu sebelum melakukan transaksi
    for (const item of items) {
      const product = await getProductById(item.productId);
      const productSize = await getProductSizeStock(
        item.productId,
        item.sizeId
      );

      if (!product) {
        return res.status(400).json({
          message: `Produk dengan ID ${item.productId} tidak ditemukan`,
        });
      }

      if (!productSize) {
        return res.status(400).json({
          message: `Kombinasi produk-ukuran tidak ditemukan: ${item.productId} - ${item.sizeId}`,
        });
      }

      if (productSize.quantity < item.quantity) {
        return res.status(400).json({
          message: `Stok tidak mencukupi untuk produk ${product.nama} ukuran ${productSize.size.label}. Stok tersedia: ${productSize.quantity}, dibutuhkan: ${item.quantity}`,
        });
      }

      const itemDiskon = item.diskon || 0;
      const itemTotal = product.hargaJual * item.quantity - itemDiskon;

      // Hitung profit per item
      const itemProfit =
        (product.hargaJual - product.hargaBeli) * item.quantity - itemDiskon;
      totalItemsProfit += itemProfit;

      subtotal += itemTotal;

      itemsWithPrices.push({
        ...item,
        hargaJual: product.hargaJual,
        hargaBeli: product.hargaBeli,
        diskon: itemDiskon,
      });
    }

    // Hitung total setelah diskon transaksi
    const totalAmount = subtotal - diskon;

    // Total profit adalah profit dari semua item dikurangi diskon transaksi
    const profit = totalItemsProfit - diskon;

    // Create transaction dengan total dan profit yang sudah dihitung
    const transaction = await transactionRepo.createTransaction(
      {
        ...transactionData,
        userId,
        diskon,
        totalAmount,
        profit,
      },
      itemsWithPrices
    );

    return res.status(201).json({
      status: "success",
      message: "Transaksi berhasil dicatat",
      data: transaction,
    });
  } catch (error) {
    console.error("Error createTransaction:", error);
    return res.status(500).json({
      status: "error",
      message: `Gagal membuat transaksi: ${error.message}`,
    });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionRepo.getAllTransactions();
    return res.status(200).json({
      status: "success",
      data: transactions,
    });
  } catch (error) {
    console.error("Error getAllTransactions:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data transaksi",
    });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await transactionRepo.getTransactionById(id);

    if (!transaction) {
      return res.status(404).json({
        status: "error",
        message: "Transaksi tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      data: transaction,
    });
  } catch (error) {
    console.error("Error getTransactionById:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil detail transaksi",
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { items, diskon = 0, ...transactionData } = req.body;

    // Validate transaction exists
    const existingTransaction = await transactionRepo.getTransactionById(id);
    if (!existingTransaction) {
      return res.status(404).json({
        status: "error",
        message: "Transaksi tidak ditemukan",
      });
    }

    // Map existing items by product and size for easy lookup
    const existingItemsMap = {};
    existingTransaction.items.forEach((item) => {
      const key = `${item.productId}-${item.sizeId}`;
      existingItemsMap[key] = item;
    });

    // Validate items and calculate total
    const itemsWithPrices = [];
    let subtotal = 0;
    let totalItemsProfit = 0;

    // Validasi stok terlebih dahulu sebelum melakukan update
    for (const item of items) {
      const product = await getProductById(item.productId);
      const productSize = await getProductSizeStock(
        item.productId,
        item.sizeId
      );
      const key = `${item.productId}-${item.sizeId}`;
      const existingItem = existingItemsMap[key];

      if (!product) {
        return res.status(400).json({
          message: `Produk dengan ID ${item.productId} tidak ditemukan`,
        });
      }

      if (!productSize) {
        return res.status(400).json({
          message: `Kombinasi produk-ukuran tidak ditemukan: ${item.productId} - ${item.sizeId}`,
        });
      }

      // Hitung perubahan stok yang akan terjadi
      // Jika ini adalah item yang sudah ada, kita perlu memperhitungkan jumlah yang sudah diambil
      let stockChange = item.quantity;
      if (existingItem) {
        stockChange = item.quantity - existingItem.quantity;
      }

      // Periksa apakah stok mencukupi untuk perubahan ini
      if (productSize.quantity < stockChange) {
        return res.status(400).json({
          message: `Stok tidak mencukupi untuk produk ${product.nama} ukuran ${productSize.size.label}. Stok tersedia: ${productSize.quantity}, perubahan yang dibutuhkan: ${stockChange}`,
        });
      }

      const itemDiskon = item.diskon || 0;
      const itemTotal = product.hargaJual * item.quantity - itemDiskon;

      // Hitung profit per item
      const itemProfit =
        (product.hargaJual - product.hargaBeli) * item.quantity - itemDiskon;
      totalItemsProfit += itemProfit;

      subtotal += itemTotal;

      itemsWithPrices.push({
        ...item,
        hargaJual: product.hargaJual,
        hargaBeli: product.hargaBeli,
        diskon: itemDiskon,
      });
    }

    // Hitung total setelah diskon transaksi
    const totalAmount = subtotal - diskon;

    // Total profit adalah profit dari semua item dikurangi diskon transaksi
    const profit = totalItemsProfit - diskon;

    // Update transaksi menggunakan repository
    const updatedTransaction = await transactionRepo.updateTransaction(
      id,
      {
        ...transactionData,
        diskon,
        totalAmount,
        profit,
      },
      itemsWithPrices
    );

    return res.status(200).json({
      status: "success",
      message: "Transaksi berhasil diperbarui",
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updateTransaction:", error);
    return res.status(500).json({
      status: "error",
      message: `Gagal memperbarui transaksi: ${error.message}`,
    });
  }
};
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await transactionRepo.getTransactionById(id);
    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Transaksi tidak ditemukan",
      });
    }

    await transactionRepo.deleteTransaction(id);
    return res.status(200).json({
      status: "success",
      message: "Transaksi berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleteTransaction:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal menghapus transaksi",
    });
  }
};

export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const transactions = await transactionRepo.getTransactionsByDate(
      startDate,
      endDate
    );

    const report = {
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
      totalProfit: transactions.reduce((sum, t) => sum + t.profit, 0),
      totalItemsSold: transactions
        .flatMap((t) => t.items)
        .reduce((sum, i) => sum + i.quantity, 0),
      paymentMethodBreakdown: transactions.reduce((acc, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.totalAmount;
        return acc;
      }, {}),
      profitByDay: transactions.reduce((acc, t) => {
        const date = t.createdAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + t.profit;
        return acc;
      }, {}),
    };

    return res.status(200).json({
      status: "success",
      data: report,
    });
  } catch (error) {
    console.error("Error getSalesReport:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal membuat laporan penjualan",
    });
  }
};

// Tambahkan endpoint baru untuk laporan profit
export const getProfitReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const profitReport = await transactionRepo.getProfitReport(
      startDate,
      endDate
    );

    return res.status(200).json({
      status: "success",
      data: profitReport,
    });
  } catch (error) {
    console.error("Error getProfitReport:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal membuat laporan profit",
    });
  }
};
