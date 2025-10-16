// routes/productRoutes.js
import express from "express";
import * as productController from "../controllers/productController.js";
import * as productSizeController from "../controllers/productSizeController.js"; // Tambahkan import controller product size
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductSize,
} from "../middlewares/validation/productValidation.js";
import { uploadProduct } from "../utils/cloudinary.js";

const router = express.Router();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Protected routes (memerlukan autentikasi)
router.use(authMiddleware.verifyToken);

// Product routes
router.post(
  "/",
  uploadProduct.single("image"),
  validateCreateProduct,
  productController.createProduct
);

router.put(
  "/:id",
  uploadProduct.single("image"),
  validateUpdateProduct,
  productController.updateProduct
);

router.delete("/:id", productController.deleteProduct);

// Routes untuk low-stock produk
router.get("/low-stock", productController.getLowStockProducts);

// Routes untuk manajemen stok dan ukuran
router.post(
  "/:id/sizes",
  validateProductSize,
  productController.addProductSize
);
router.put(
  "/:id/sizes/:sizeId",
  validateProductSize,
  productController.updateProductSize
);
router.delete("/:id/sizes/:sizeId", productController.deleteProductSize);

// Route untuk sinkronisasi stok produk
router.post("/sync-stocks", productController.syncAllProductStocks);

export default router;
