// routes/stockBatchRoutes.js
import express from "express";
import * as stockBatchController from "../controllers/stockBatchController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateStockBatch,
  validateUpdateStockBatch,
} from "../middlewares/validation/stockBatchValidation.js";

const router = express.Router();

// Middleware autentikasi
router.use(authMiddleware.verifyToken);

// Route CRUD stock batch
router.get("/", stockBatchController.getAllStockBatches);
router.post("/", validateCreateStockBatch, stockBatchController.createStockBatch);
router.get("/:id", stockBatchController.getStockBatchById);
router.put("/:id", validateUpdateStockBatch, stockBatchController.updateStockBatch);
router.delete("/:id", stockBatchController.deleteStockBatch);

export default router;
