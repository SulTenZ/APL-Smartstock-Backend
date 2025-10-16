// middleware/validation/productTypeValidation.js
import { body } from "express-validator";

export const validateCreateProductType = [
  body("name")
    .notEmpty()
    .withMessage("Nama tipe produk harus diisi")
    .isString()
    .withMessage("Nama tipe produk harus berupa teks")
    .isLength({ min: 2, max: 50 })
    .withMessage("Nama tipe produk harus memiliki 2-50 karakter")
    .trim(),
];

export const validateUpdateProductType = [
  body("name")
    .notEmpty()
    .withMessage("Nama tipe produk harus diisi")
    .isString()
    .withMessage("Nama tipe produk harus berupa teks")
    .isLength({ min: 2, max: 50 })
    .withMessage("Nama tipe produk harus memiliki 2-50 karakter")
    .trim(),
];
