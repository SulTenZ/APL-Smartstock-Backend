// routes/transactionRoutes.js
import express from "express";
import * as transactionController from "../controllers/transactionController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateTransaction,
  validateUpdateTransaction,
} from "../middlewares/validation/transactionValidation.js";

const router = express.Router();

// Public routes
router.get("/", transactionController.getAllTransactions);
router.get("/:id", transactionController.getTransactionById);

// Protected routes
router.use(authMiddleware.verifyToken);

router.post(
  "/",
  validateCreateTransaction,
  transactionController.createTransaction
);
router.put(
  "/:id",
  validateUpdateTransaction,
  transactionController.updateTransaction
);
router.delete("/:id", transactionController.deleteTransaction);
router.get("/report/sales", transactionController.getSalesReport);
router.get("/report/profit", transactionController.getProfitReport);

export default router;