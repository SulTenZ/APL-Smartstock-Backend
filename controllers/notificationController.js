// controllers/notificationController.js
import prisma from "../config/prisma.js";
import {
  sendLowStockNotification,
  sendOutOfStockNotification,
  sendNotification,
} from "../utils/oneSignal.js";

export const checkLowStockProducts = async (req, res) => {
  try {
    console.log("Cron Job: Starting daily low stock check...");
    const notificationsSentDetails = [];

    // --- 1. Logika untuk Produk Stok Rendah (Low Stock) ---
    // Cari produk yang stoknya rendah dan BELUM ADA log notifikasi 'LOW_STOCK'
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: prisma.product.fields.minStock,
          gt: 0,
        },
        notificationLogs: {
          none: { status: "LOW_STOCK" },
        },
      },
      include: {
        sizes: { include: { size: true } },
      },
    });

    for (const product of lowStockProducts) {
      const result = await sendLowStockNotification(product, product.sizes);
      if (result.success) {
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

    // --- 2. Logika untuk Produk Stok Habis (Out of Stock) ---
    // Cari produk yang stoknya habis dan BELUM ADA log notifikasi 'OUT_OF_STOCK'
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        stock: 0,
        notificationLogs: {
          none: { status: "OUT_OF_STOCK" },
        },
      },
    });

    for (const product of outOfStockProducts) {
      const result = await sendOutOfStockNotification(product);
      if (result.success) {
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

    // --- 3. Logika Pembersihan untuk Produk yang Sudah di-Restock ---
    // Cari produk yang stoknya sudah normal TAPI masih punya log notifikasi
    const restockedProducts = await prisma.product.findMany({
      where: {
        stock: {
          gt: prisma.product.fields.minStock,
        },
        notificationLogs: {
          some: {}, // Cek apakah ada log notifikasi apapun
        },
      },
      select: {
        id: true,
      },
    });

    if (restockedProducts.length > 0) {
      const productIdsToClear = restockedProducts.map((p) => p.id);
      await prisma.notificationLog.deleteMany({
        where: {
          productId: { in: productIdsToClear },
        },
      });
      console.log(`Cleared notification logs for ${productIdsToClear.length} restocked products.`);
    }

    console.log("Cron Job: Finished daily low stock check.");
    return res.status(200).json({
      status: "success",
      message: "Pengecekan stok harian selesai.",
      data: {
        notificationsSentCount: notificationsSentDetails.length,
        details: notificationsSentDetails,
      },
    });
  } catch (error) {
    console.error("Error during daily low stock check:", error);
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