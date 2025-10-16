// middlewares/validation/transactionValidation.js
import { body, check } from "express-validator";

export const validateCreateTransaction = [
  body("paymentMethod")
    .notEmpty()
    .withMessage("Metode pembayaran wajib diisi")
    .isIn(["CASH", "CREDIT_CARD", "DEBIT_CARD", "TRANSFER", "DIGITAL_WALLET"])
    .withMessage("Metode pembayaran tidak valid"),

  // Hapus validasi totalAmount karena akan dihitung otomatis

  body("diskon")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Diskon harus angka positif"),

  body("customerId")
    .optional()
    .isString()
    .withMessage("ID Pelanggan harus string"),

  check("items.*.productId")
    .notEmpty()
    .withMessage("Product ID wajib diisi")
    .isString()
    .withMessage("Product ID harus string"),

  check("items.*.sizeId")
    .notEmpty()
    .withMessage("Size ID wajib diisi")
    .isString()
    .withMessage("Size ID harus string"),

  check("items.*.quantity")
    .notEmpty()
    .withMessage("Quantity wajib diisi")
    .isInt({ min: 1 })
    .withMessage("Quantity harus integer minimal 1"),

  check("items.*.diskon")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Diskon item harus angka positif"),
];

export const validateUpdateTransaction = [
  body("paymentMethod")
    .optional()
    .isIn(["CASH", "CREDIT_CARD", "DEBIT_CARD", "TRANSFER", "DIGITAL_WALLET"])
    .withMessage("Metode pembayaran tidak valid"),

  // Hapus validasi totalAmount karena akan dihitung otomatis

  body("diskon")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Diskon harus angka positif"),

  body("customerId")
    .optional()
    .isString()
    .withMessage("ID Pelanggan harus string"),

  check("items.*.productId")
    .notEmpty()
    .withMessage("Product ID wajib diisi")
    .isString()
    .withMessage("Product ID harus string"),

  check("items.*.sizeId")
    .notEmpty()
    .withMessage("Size ID wajib diisi")
    .isString()
    .withMessage("Size ID harus string"),

  check("items.*.quantity")
    .notEmpty()
    .withMessage("Quantity wajib diisi")
    .isInt({ min: 1 })
    .withMessage("Quantity harus integer minimal 1"),

  check("items.*.diskon")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Diskon item harus angka positif"),
];
