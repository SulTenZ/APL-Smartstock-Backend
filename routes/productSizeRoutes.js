// routes/productSizeRoutes.js
import express from "express";
import * as productSizeController from "../controllers/productSizeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateProductSize,
  validateUpdateProductSize,
} from "../middlewares/validation/productSizeValidation.js";

const router = express.Router();

router.get("/", productSizeController.getAllProductSizes);
router.get("/:id", productSizeController.getProductSizeById);

router.use(authMiddleware.verifyToken);

router.post(
  "/",
  validateCreateProductSize,
  productSizeController.createProductSize
);
router.put(
  "/:id",
  validateUpdateProductSize,
  productSizeController.updateProductSize
);
router.delete("/:id", productSizeController.deleteProductSize);
router.get(
  "/product/:productId/size/:sizeId",
  productSizeController.getProductSizeStock
);
router.post("/sync", productSizeController.syncAllProductStocks);
export default router;
