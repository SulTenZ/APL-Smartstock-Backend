// middlewares/validation/productSizeValidation.js
import { body } from "express-validator";

export const validateCreateProductSize = [
  body("productId").notEmpty().withMessage("ID produk wajib diisi"),
  body("sizeId").notEmpty().withMessage("ID ukuran wajib diisi"),
  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Jumlah stok harus bilangan bulat >= 0"),
];

export const validateUpdateProductSize = [
  body("quantity")
    .notEmpty()
    .withMessage("Jumlah stok wajib diisi")
    .isInt({ min: 0 })
    .withMessage("Jumlah stok harus bilangan bulat >= 0"),
];