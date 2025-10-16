// routes/transactionItemRoutes.js
import express from "express";
import * as transactionItemController from "../controllers/transactionItemController.js";
import { createTransactionItemValidation, updateTransactionItemValidation } from "../middlewares/validation/transactionItemValidation.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.get("/", transactionItemController.getAllTransactionItems);
router.get("/:id", transactionItemController.getTransactionItemById);
router.post("/", createTransactionItemValidation, transactionItemController.createTransactionItem);
router.put("/:id", updateTransactionItemValidation, transactionItemController.updateTransactionItem);
router.delete("/:id", transactionItemController.deleteTransactionItem);

export default router;
