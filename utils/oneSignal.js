// utils/oneSignal.js
import axios from "axios";
import dotenv from "dotenv";
import prisma from "../config/prisma.js"; // <-- Import Prisma Client

dotenv.config();

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
const ONESIGNAL_API_URL = "https://onesignal.com/api/v1/notifications";

/**
 * Fungsi internal untuk menyimpan notifikasi ke database
 */
const saveNotificationToDb = async (notificationData) => {
  try {
    const { heading, content, data, segments } = notificationData;
    const type = data?.type || 'CUSTOM';

    // Jika targetnya adalah semua user (segments "All"), ambil semua ID user
    if (segments?.includes("All")) {
      const allUsers = await prisma.user.findMany({
        select: { id: true },
      });

      const notificationsToCreate = allUsers.map(user => ({
        userId: user.id,
        type: type,
        heading: heading,
        content: content,
        productId: data?.productId || null,
      }));

      // Buat notifikasi untuk setiap user
      await prisma.notification.createMany({
        data: notificationsToCreate,
      });

      console.log(`Saved ${allUsers.length} notifications to DB for all users.`);
    }
    // Note: Anda bisa menambahkan logika untuk segments lain atau playerIds di sini jika perlu
    
  } catch (error) {
    console.error("Error saving notification to database:", error);
  }
};


/**
 * Mengirim notifikasi dan menyimpannya ke database
 */
export const sendNotification = async ({
  heading,
  content,
  data = {},
  playerIds = null,
  segments = ["All"],
  imageUrl = null,
  bigPicture = null,
}) => {
  try {
    const notificationBody = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: heading },
      contents: { en: content },
      data: data,
    };

    if (playerIds && playerIds.length > 0) {
      notificationBody.include_player_ids = playerIds;
    } else {
      notificationBody.included_segments = segments;
    }

    if (imageUrl) {
      notificationBody.small_icon = imageUrl;
      notificationBody.large_icon = imageUrl;
    }

    if (bigPicture) {
      notificationBody.big_picture = bigPicture;
    }

    const response = await axios.post(ONESIGNAL_API_URL, notificationBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
    });

    console.log("OneSignal notification sent successfully:", response.data);

    // --- SIMPAN NOTIFIKASI KE DB SETELAH BERHASIL DIKIRIM ---
    await saveNotificationToDb({ heading, content, data, segments });
    // --------------------------------------------------------

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error sending OneSignal notification:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

// ... sisa file (sendLowStockNotification, dll) tidak perlu diubah ...
export const sendLowStockNotification = async (product, lowStockSizes) => {
  const sizeLabels = lowStockSizes.map(s => s.size.label).join(", ");
  
  return sendNotification({
    heading: "⚠️ Peringatan Stok Rendah",
    content: `Produk "${product.nama}" ukuran ${sizeLabels} stoknya rendah! Segera restock.`,
    data: {
      type: "LOW_STOCK",
      productId: product.id,
      productName: product.nama,
      currentStock: product.stock,
      minStock: product.minStock,
      sizes: lowStockSizes.map(s => ({
        label: s.size.label,
        quantity: s.quantity,
      })),
    },
    imageUrl: product.image,
    bigPicture: product.image,
  });
};

export const sendOutOfStockNotification = async (product) => {
  return sendNotification({
    heading: "🚨 Stok Habis!",
    content: `Produk "${product.nama}" telah habis! Perlu restock segera.`,
    data: {
      type: "OUT_OF_STOCK",
      productId: product.id,
      productName: product.nama,
    },
    imageUrl: product.image,
    bigPicture: product.image,
  });
};

export const sendCustomNotification = async (playerIds, heading, content, data = {}) => {
  return sendNotification({
    heading,
    content,
    data,
    playerIds,
  });
};

export default {
  sendNotification,
  sendLowStockNotification,
  sendOutOfStockNotification,
  sendCustomNotification,
};
