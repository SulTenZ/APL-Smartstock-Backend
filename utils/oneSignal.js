// utils/oneSignal.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
const ONESIGNAL_API_URL = "https://onesignal.com/api/v1/notifications";

/**
 * Mengirim notifikasi ke semua pengguna yang tersubscribe
 * @param {Object} notification - Object notifikasi
 * @param {string} notification.heading - Judul notifikasi
 * @param {string} notification.content - Isi notifikasi
 * @param {Object} notification.data - Data tambahan (opsional)
 * @param {Array} notification.playerIds - Array player IDs spesifik (opsional)
 * @param {Array} notification.segments - Array segments (default: ["All"])
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

    // Jika playerIds diberikan, gunakan include_player_ids
    // Jika tidak, gunakan segments
    if (playerIds && playerIds.length > 0) {
      notificationBody.include_player_ids = playerIds;
    } else {
      notificationBody.included_segments = segments;
    }

    // Tambahkan gambar jika ada
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

/**
 * Mengirim notifikasi stok rendah
 * @param {Object} product - Data produk
 * @param {Array} lowStockSizes - Array ukuran dengan stok rendah
 */
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

/**
 * Mengirim notifikasi stok habis
 * @param {Object} product - Data produk
 */
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

/**
 * Mengirim notifikasi custom ke pengguna tertentu
 * @param {Array} playerIds - Array OneSignal player IDs
 * @param {string} heading - Judul notifikasi
 * @param {string} content - Isi notifikasi
 * @param {Object} data - Data tambahan
 */
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