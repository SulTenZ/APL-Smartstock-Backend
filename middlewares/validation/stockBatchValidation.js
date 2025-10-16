// middlewares/validation/stockBatchValidation.js
import { body } from "express-validator";

export const validateCreateStockBatch = [
  body("nama").notEmpty().withMessage("Nama batch wajib diisi"),
  body("totalHarga").isFloat({ gt: 0 }).withMessage("Total harga harus lebih dari 0"),
  body("jumlahSepatu").isInt({ gt: 0 }).withMessage("Jumlah sepatu harus lebih dari 0"),
];

export const validateUpdateStockBatch = [
  body("nama").optional().notEmpty().withMessage("Nama batch tidak boleh kosong jika diisi"),
  body("totalHarga").optional().isFloat({ gt: 0 }).withMessage("Total harga harus lebih dari 0"),
  body("jumlahSepatu").optional().isInt({ gt: 0 }).withMessage("Jumlah sepatu harus lebih dari 0"),
];