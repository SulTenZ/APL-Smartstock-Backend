// middlewares/validation/sizeValidation.js
import { body } from "express-validator";

export const validateCreateSize = [
  body("label")
    .notEmpty().withMessage("Label ukuran wajib diisi")
    .isString().withMessage("Label harus berupa teks")
    .trim(),
  body("productTypeId")
    .notEmpty().withMessage("ID tipe produk wajib diisi")
    .isUUID().withMessage("ID tipe produk harus valid"),
];

export const validateUpdateSize = validateCreateSize;
