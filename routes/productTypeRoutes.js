// routes/productTypeRoutes.js
import express from "express";
import * as productTypeController from "../controllers/productTypeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateProductType,
  validateUpdateProductType,
} from "../middlewares/validation/productTypeValidation.js";

const router = express.Router();

// GET /api/product-types - Mendapatkan semua tipe produk
router.get("/", productTypeController.getAllProductTypes);

// GET /api/product-types/:id - Mendapatkan detail tipe produk berdasarkan ID
router.get("/:id", productTypeController.getProductTypeById);
// rute memerlukan autentikasi jika melakukan crud

router.use(authMiddleware.verifyToken);

// POST /api/product-types - Membuat tipe produk baru
router.post(
  "/",
  validateCreateProductType,
  productTypeController.createProductType
);

// PUT /api/product-types/:id - Memperbarui tipe produk
router.put(
  "/:id",
  validateUpdateProductType,
  productTypeController.updateProductType
);

// DELETE /api/product-types/:id - Menghapus tipe produk
router.delete("/:id", productTypeController.deleteProductType);

export default router;
