// controllers/notificationController.js
import prisma from "../config/prisma.js";
import {
  sendLowStockNotification,
  sendOutOfStockNotification,
  sendNotification,
} from "../utils/oneSignal.js";

// --- FUNGSI-FUNGSI BARU UNTUK MOBILE APP ---

export const getNotificationsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            nama: true,
            image: true,
          },
        },
      },
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Notifikasi berhasil diambil",
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Error getting notifications for user:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal mengambil notifikasi" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findUnique({
      where: { id: id },
    });

    if (!notification) {
      return res
        .status(404)
        .json({ status: "error", message: "Notifikasi tidak ditemukan" });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({
        status: "error",
        message: "Anda tidak berhak mengakses notifikasi ini",
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: id },
      data: { isRead: true },
    });

    return res.status(200).json({
      status: "success",
      message: "Notifikasi ditandai sebagai sudah dibaca",
      data: updatedNotification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal memperbarui notifikasi" });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Semua notifikasi ditandai sebagai sudah dibaca",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal memperbarui notifikasi" });
  }
};

// --- KODE LOGIKA CRON JOB (DENGAN LOGGING YANG DIPERBAIKI) ---

export const checkLowStockProducts = async (req, res) => {
  try {
    console.log("⏰ Cron Job: Memulai pengecekan stok...");
    const notificationsSentDetails = [];

    // 1. Cek Low Stock
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: prisma.product.fields.minStock,
          gt: 0,
        },
        // Fitur Anti-Spam: Hanya ambil yang belum ada log notifikasinya
        notificationLogs: {
          none: { status: "LOW_STOCK" },
        },
      },
      include: {
        sizes: { include: { size: true } },
      },
    });

    console.log(
      `🔍 Ditemukan ${lowStockProducts.length} produk low stock baru.`
    );

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

    // 2. Cek Out Of Stock
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        stock: 0,
        notificationLogs: {
          none: { status: "OUT_OF_STOCK" },
        },
      },
    });

    console.log(
      `🔍 Ditemukan ${outOfStockProducts.length} produk stok habis baru.`
    );

    for (const product of outOfStockProducts) {
      const result = await sendOutOfStockNotification(product);
      if (result.success) {
        // Hapus log low stock lama, ganti dengan out of stock
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

    // 3. Bersihkan Log Produk Restock
    const restockedProducts = await prisma.product.findMany({
      where: {
        stock: {
          gt: prisma.product.fields.minStock,
        },
        notificationLogs: {
          some: {}, // Hanya ambil yang punya log (biar query efisien)
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
      console.log(
        `🧹 Membersihkan log untuk ${productIdsToClear.length} produk yang sudah restock.`
      );
    }

    console.log("✅ Cron Job: Pengecekan selesai.");

    return res.status(200).json({
      status: "success",
      message: "Pengecekan stok harian selesai.",
      data: {
        notificationsSentCount: notificationsSentDetails.length,
        details: notificationsSentDetails,
      },
    });
  } catch (error) {
    console.error("❌ Error Cron Job:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengecek stok produk",
      error: error.message,
    });
  }
};

// --- FUNGSI CUSTOM NOTIFICATION (TETAP SAMA) ---
export const sendCustomNotification = async (req, res) => {
  try {
    const { heading, content, data, playerIds, segments, userIds } = req.body;

    if (!heading || !content) {
      return res.status(400).json({
        status: "error",
        message: "Heading dan content harus diisi",
      });
    }

    let targetExternalIds = null;

    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { email: true },
      });

      targetExternalIds = users.map((u) => u.email).filter((e) => e !== null);
    }

    const result = await sendNotification({
      heading,
      content,
      data: data || {},
      playerIds: playerIds || null,
      externalUserIds: targetExternalIds,
      segments: targetExternalIds || playerIds ? null : segments || ["All"],
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
