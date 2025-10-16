// routes/notificationRoutes.js
import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import cronAuthMiddleware from "../middlewares/cronAuthMiddleware.js";

const router = express.Router();

// --- CRON JOB ROUTE (Otentikasi khusus) ---
router.post(
  "/check-low-stock",
  cronAuthMiddleware.verifyCronSecret,
  notificationController.checkLowStockProducts
);


// --- ROUTES UNTUK MOBILE APP (Otentikasi user biasa) ---

// Middleware untuk semua route di bawah ini
router.use(authMiddleware.verifyToken);

// GET semua notifikasi untuk user
router.get("/", notificationController.getNotificationsForUser);

// POST untuk menandai semua notifikasi sebagai sudah dibaca
router.post("/read-all", notificationController.markAllNotificationsAsRead);

// PATCH untuk menandai satu notifikasi sebagai sudah dibaca
router.patch("/:id/read", notificationController.markNotificationAsRead);


// --- ROUTES LAMA (tetap di bawah otentikasi user biasa) ---
router.post("/send-custom", notificationController.sendCustomNotification);
router.post("/test", notificationController.sendTestNotification);
router.get("/stats", notificationController.getNotificationStats);

export default router;