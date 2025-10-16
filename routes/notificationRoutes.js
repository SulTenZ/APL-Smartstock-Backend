// routes/notificationRoutes.js
import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import cronAuthMiddleware from "../middlewares/cronAuthMiddleware.js"; // <-- Import middleware baru

const router = express.Router();

// Endpoint ini yang akan dipanggil oleh cron-job.org
// Menggunakan middleware khusus untuk cron job
router.post(
  "/check-low-stock",
  cronAuthMiddleware.verifyCronSecret, // <-- Gunakan middleware cron di sini
  notificationController.checkLowStockProducts
);

// --- Routes di bawah ini tetap memerlukan autentikasi login user biasa ---
router.use(authMiddleware.verifyToken);

// Route untuk mengirim notifikasi custom
router.post("/send-custom", notificationController.sendCustomNotification);

// Route untuk test notifikasi
router.post("/test", notificationController.sendTestNotification);

// Route untuk mendapatkan statistik notifikasi
router.get("/stats", notificationController.getNotificationStats);

export default router;
