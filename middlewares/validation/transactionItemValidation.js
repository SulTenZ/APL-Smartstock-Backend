// middlewares/validation/transactionItemValidation.js
import { body } from "express-validator";

export const createTransactionItemValidation = [
  body("transactionId").notEmpty().withMessage("Transaction ID wajib diisi"),
  body("productId").notEmpty().withMessage("Product ID wajib diisi"),
  body("sizeId").notEmpty().withMessage("Size ID wajib diisi"),
  body("quantity").isInt({ gt: 0 }).withMessage("Quantity harus lebih dari 0"),
  body("hargaJual").isFloat({ gt: 0 }).withMessage("Harga jual harus lebih dari 0"),
  body("hargaBeli").isFloat({ gt: 0 }).withMessage("Harga beli harus lebih dari 0"),
];

export const updateTransactionItemValidation = [
  body("quantity").optional().isInt({ gt: 0 }).withMessage("Quantity harus lebih dari 0"),
  body("hargaJual").optional().isFloat({ gt: 0 }).withMessage("Harga jual harus lebih dari 0"),
  body("hargaBeli").optional().isFloat({ gt: 0 }).withMessage("Harga beli harus lebih dari 0"),
];
