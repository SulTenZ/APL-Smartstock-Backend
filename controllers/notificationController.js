// controllers/notificationController.js

import prisma from "../config/prisma.js";
import {
  sendLowStockNotification,
  sendOutOfStockNotification,
  sendNotification,
} from "../utils/oneSignal.js";

/**
 * Cek semua produk dengan stok rendah/habis dan kirim notifikasi jika belum pernah dikirim.
 * Juga membersihkan log notifikasi jika produk sudah di-restock.
 */
export const checkLowStockProducts = async (req, res) => {
  try {
    console.log("Cron Job: Starting low stock check...");
    const notificationsSentDetails = [];

    // --- 1. Logika untuk Produk Stok Rendah (Low Stock) ---
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: prisma.product.fields.minStock,
          gt: 0,
        },
      },
      include: {
        sizes: { include: { size: true } },
        notificationLogs: {
          where: { status: "LOW_STOCK" },
        },
      },
    });

    for (const product of lowStockProducts) {
      // Kirim notifikasi HANYA jika belum ada log 'LOW_STOCK' untuk produk ini
      if (product.notificationLogs.length === 0) {
        const result = await sendLowStockNotification(product, product.sizes);
        if (result.success) {
          // Buat log bahwa notifikasi telah dikirim
          await prisma.notificationLog.create({
            data: {
              productId: product.id,
              status: "LOW_STOCK",
            },
          });
          notificationsSentDetails.push({
            productName: product.nama,
            type: "LOW_STOCK",
            success: true,
          });
        }
      }
    }

    // --- 2. Logika untuk Produk Stok Habis (Out of Stock) ---
    const outOfStockProducts = await prisma.product.findMany({
      where: { stock: 0 },
      include: {
        notificationLogs: {
          where: { status: "OUT_OF_STOCK" },
        },
      },
    });

    for (const product of outOfStockProducts) {
      // Kirim notifikasi HANYA jika belum ada log 'OUT_OF_STOCK'
      if (product.notificationLogs.length === 0) {
        const result = await sendOutOfStockNotification(product);
        if (result.success) {
          // Hapus log LOW_STOCK jika ada, ganti dengan OUT_OF_STOCK
          await prisma.notificationLog.deleteMany({
            where: { productId: product.id, status: "LOW_STOCK" },
          });
          await prisma.notificationLog.create({
            data: {
              productId: product.id,
              status: "OUT_OF_STOCK",
            },
          });
          notificationsSentDetails.push({
            productName: product.nama,
            type: "OUT_OF_STOCK",
            success: true,
          });
        }
      }
    }

    // --- 3. Logika Pembersihan (Cleanup Logic for Restocked Products) ---
    const previouslyNotifiedProducts = await prisma.product.findMany({
      where: {
        stock: {
          gt: prisma.product.fields.minStock, // Stok sudah kembali normal
        },
        OR: [
          { notificationLogs: { some: { status: "LOW_STOCK" } } },
          { notificationLogs: { some: { status: "OUT_OF_STOCK" } } },
        ],
      },
    });

    if (previouslyNotifiedProducts.length > 0) {
        const productIdsToClear = previouslyNotifiedProducts.map(p => p.id);
        await prisma.notificationLog.deleteMany({
            where: {
                productId: { in: productIdsToClear },
            },
        });
        console.log(`Cleared notification logs for ${productIdsToClear.length} restocked products.`);
    }


    console.log("Cron Job: Finished low stock check.");
    return res.status(200).json({
      status: "success",
      message: "Pengecekan stok selesai.",
      data: {
        notificationsSentCount: notificationsSentDetails.length,
        details: notificationsSentDetails,
      },
    });
  } catch (error) {
    console.error("Error checking low stock products:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengecek stok produk",
      error: error.message,
    });
  }
};


/**
 * Kirim notifikasi custom (manual)
 */
export const sendCustomNotification = async (req, res) => {
  try {
    const { heading, content, data, playerIds, segments } = req.body;

    if (!heading || !content) {
      return res.status(400).json({
        status: "error",
        message: "Heading dan content harus diisi",
      });
    }

    const result = await sendNotification({
      heading,
      content,
      data: data || {},
      playerIds: playerIds || null,
      segments: segments || ["All"],
    });

    if (result.success) {
      return res.status(200).json({
        status: "success",
        message: "Notifikasi berhasil dikirim",
        data: result.data,
      });
    } else {
      return res.status(500).json({
        status: "error",
        message: "Gagal mengirim notifikasi",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error sending custom notification:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengirim notifikasi",
      error: error.message,
    });
  }
};

/**
 * Test endpoint untuk mengirim notifikasi test
 */
export const sendTestNotification = async (req, res) => {
  try {
    const result = await sendNotification({
      heading: "🧪 Test Notification",
      content: "Ini adalah notifikasi test dari APL Shoes Backend",
      data: {
        type: "TEST",
        timestamp: new Date().toISOString(),
      },
    });

    if (result.success) {
      return res.status(200).json({
        status: "success",
        message: "Notifikasi test berhasil dikirim",
        data: result.data,
      });
    } else {
      return res.status(500).json({
        status: "error",
        message: "Gagal mengirim notifikasi test",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error sending test notification:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengirim notifikasi test",
      error: error.message,
    });
  }
};

/**
 * Get notification stats
 */
export const getNotificationStats = async (req, res) => {
  try {
    // Ambil statistik produk dengan stok rendah
    const lowStockCount = await prisma.product.count({
      where: {
        stock: {
          lte: prisma.product.fields.minStock,
        },
        stock: {
          gt: 0,
        },
      },
    });

    const outOfStockCount = await prisma.product.count({
      where: {
        stock: 0,
      },
    });

    const totalProducts = await prisma.product.count();

    return res.status(200).json({
      status: "success",
      message: "Statistik notifikasi berhasil diambil",
      data: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        healthyStockCount: totalProducts - lowStockCount - outOfStockCount,
      },
    });
  } catch (error) {
    console.error("Error getting notification stats:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil statistik",
      error: error.message,
    });
  }
};