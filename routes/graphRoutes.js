// routes/graphRoutes.js
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getProfitReportGraph } from "../controllers/graphController.js";

const router = express.Router();

// Proteksi dengan JWT seperti endpoint laporan lain
router.use(authMiddleware.verifyToken);

// GET /api/graph/profit-report?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get("/profit-report", getProfitReportGraph);

export default router;