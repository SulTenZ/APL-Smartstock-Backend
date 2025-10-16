// middlewares/validation/categoryValidation.js
import { body } from "express-validator";

export const validateCreateCategory = [
  body("nama")
    .notEmpty().withMessage("Nama kategori harus diisi")
    .isString().withMessage("Nama kategori harus berupa teks")
    .isLength({ min: 2, max: 50 }).withMessage("Panjang nama kategori 2-50 karakter")
    .trim(),
  body("deskripsi").optional().isString().trim(),
  body("productTypeId")
    .notEmpty().withMessage("Tipe produk harus diisi")
    .isUUID().withMessage("ID tipe produk harus berupa UUID"),
];

export const validateUpdateCategory = [
  body("nama")
    .notEmpty().withMessage("Nama kategori harus diisi")
    .isString().withMessage("Nama kategori harus berupa teks")
    .isLength({ min: 2, max: 50 }).withMessage("Panjang nama kategori 2-50 karakter")
    .trim(),
  body("deskripsi").optional().isString().trim(),
  body("productTypeId")
    .notEmpty().withMessage("Tipe produk harus diisi")
    .isUUID().withMessage("ID tipe produk harus berupa UUID"),
];
