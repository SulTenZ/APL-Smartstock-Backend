// routes/auditLogRoutes.js
import express from "express";
import * as auditLogController from "../controllers/auditLogController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua rute di sini memerlukan autentikasi
router.use(authMiddleware.verifyToken);

// GET /api/audit-log - Mendapatkan semua log dengan paginasi
router.get("/", auditLogController.getAuditLogs);

export default router;