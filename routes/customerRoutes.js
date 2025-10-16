// routes/customerRoutes.js
import express from "express";
import * as customerController from "../controllers/customerController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createCustomerValidation,
  updateCustomerValidation,
} from "../middlewares/validation/customerValidation.js";

const router = express.Router();

// Route publik (jika ada, bisa dipindahkan ke atas seperti get katalog pelanggan umum)
router.get("/", customerController.getAllCustomers);
router.get("/:id", customerController.getCustomerById);

// Proteksi semua route setelah ini
router.use(authMiddleware.verifyToken);

// Route yang butuh autentikasi
router.post("/", createCustomerValidation, customerController.createCustomer);
router.put("/:id", updateCustomerValidation, customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

export default router;
