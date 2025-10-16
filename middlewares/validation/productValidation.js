// middlewares/validation/productValidation.js
import { body } from "express-validator";

export const validateCreateProduct = [
  body("nama").notEmpty().withMessage("Nama produk harus diisi"),
  body("hargaBeli")
    .isFloat({ min: 0 })
    .withMessage("Harga beli harus berupa angka positif"),
  body("hargaJual")
    .isFloat({ min: 0 })
    .withMessage("Harga jual harus berupa angka positif"),
  body("categoryId").isInt({ min: 1 }).withMessage("Kategori harus dipilih"),
  body("brandId").isInt({ min: 1 }).withMessage("Brand harus dipilih"),
  body("productTypeId").notEmpty().withMessage("Tipe produk harus dipilih"),
  body("minStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum stok harus berupa angka positif"),
  body("kondisi")
    .optional()
    .isIn(["BARU", "BEKAS", "REKONDISI"])
    .withMessage("Kondisi harus berupa BARU, BEKAS, atau REKONDISI"),
  body("sizes.*.sizeId")
    .optional()
    .notEmpty()
    .withMessage("ID ukuran harus diisi"),
  body("sizes.*.quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Jumlah stok harus berupa angka positif"),
];

export const validateUpdateProduct = [
  body("nama")
    .optional()
    .notEmpty()
    .withMessage("Nama produk tidak boleh kosong"),
  body("hargaBeli")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Harga beli harus berupa angka positif"),
  body("hargaJual")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Harga jual harus berupa angka positif"),
  body("categoryId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Kategori harus dipilih"),
  body("brandId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Brand harus dipilih"),
  body("productTypeId")
    .optional()
    .notEmpty()
    .withMessage("Tipe produk harus dipilih"),
  body("minStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum stok harus berupa angka positif"),
  body("kondisi")
    .optional()
    .isIn(["BARU", "BEKAS", "REKONDISI"])
    .withMessage("Kondisi harus berupa BARU, BEKAS, atau REKONDISI"),
  body("sizes.*.sizeId")
    .optional()
    .notEmpty()
    .withMessage("ID ukuran harus diisi"),
  body("sizes.*.quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Jumlah stok harus berupa angka positif"),
];

export const validateProductSize = [
  body("sizeId").notEmpty().withMessage("ID ukuran harus diisi"),
  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Jumlah stok harus berupa angka positif"),
];
