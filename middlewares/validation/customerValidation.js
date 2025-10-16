// middlewares/validation/customerValidation.js
import { body } from "express-validator";

export const createCustomerValidation = [
  body("nama").notEmpty().withMessage("Nama tidak boleh kosong"),
  body("phone").optional().isString().withMessage("Nomor telepon tidak valid"),
];

export const updateCustomerValidation = [
  body("nama").optional().isString().withMessage("Nama harus berupa teks"),
  body("phone").optional().isString().withMessage("Nomor telepon tidak valid"),
];
