// middlewares/validation/brandValidation.js
import { body } from "express-validator";

export const validateCreateBrand = [
  body("nama")
    .notEmpty().withMessage("Nama brand harus diisi")
    .isString().isLength({ min: 2, max: 50 }).trim(),
  body("deskripsi").optional().isString().trim(),
];

export const validateUpdateBrand = [
  body("nama")
    .notEmpty().withMessage("Nama brand harus diisi")
    .isString().isLength({ min: 2, max: 50 }).trim(),
  body("deskripsi").optional().isString().trim(),
];
