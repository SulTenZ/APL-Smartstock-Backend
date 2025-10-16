import express from "express";
import * as reportController from "../controllers/reportController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua rute di sini memerlukan autentikasi
router.use(authMiddleware.verifyToken);

// GET /api/reports/financial-summary -> untuk melihat data di aplikasi
router.get("/financial-summary", reportController.getFinancialSummaryReport);

// GET /api/reports/financial-summary/download -> untuk download PDF
router.get("/financial-summary/download", reportController.downloadFinancialSummaryPDF);

export default router;