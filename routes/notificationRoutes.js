// routes/notificationRoutes.js
import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
// Import middleware khusus Cron (gunakan destructuring { })
import { verifyCronSecret } from "../middlewares/cronAuthMiddleware.js";

const router = express.Router();

// ==========================================
// 1. ROUTE KHUSUS CRON JOB (Server-to-Server)
// ==========================================
// Endpoint ini dilindungi oleh Secret Key, bukan Token User.
// Method GET lebih umum untuk Cron Job sederhana.
router.get(
  "/check-low-stock",
  verifyCronSecret,
  notificationController.checkLowStockProducts
);

// ==========================================
// 2. ROUTE USER (Mobile App)
// ==========================================
// Semua route di bawah ini mewajibkan header "Authorization: Bearer <token_login>"
router.use(authMiddleware.verifyToken);

// Mengambil list notifikasi user
router.get("/", notificationController.getNotificationsForUser);

// Menandai semua sudah dibaca
router.post("/read-all", notificationController.markAllNotificationsAsRead);

// Menandai satu notifikasi sudah dibaca
router.patch("/:id/read", notificationController.markNotificationAsRead);

// --- ROUTES UNTUK TESTING / ADMIN MANUAL ---
router.post("/send-custom", notificationController.sendCustomNotification);
router.post("/test", notificationController.sendTestNotification);
router.get("/stats", notificationController.getNotificationStats);

export default router;
