// controllers/customerController.js
import * as customerRepository from "../repositories/customerRepository.js";
import { validationResult } from "express-validator";

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await customerRepository.findAll();
    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil semua customer",
      data: customers,
    });
  } catch (error) {
    console.error("Error getAllCustomers:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil data customer",
    });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customerRepository.findById(id);

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil detail customer",
      data: customer,
    });
  } catch (error) {
    console.error("Error getCustomerById:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil detail customer",
    });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        errors: errors.array(),
      });
    }

    const data = req.body;
    const customer = await customerRepository.create(data);

    return res.status(201).json({
      status: "success",
      message: "Customer berhasil ditambahkan",
      data: customer,
    });
  } catch (error) {
    console.error("Error createCustomer:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menambahkan customer",
    });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const data = req.body;

    const existing = await customerRepository.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Customer tidak ditemukan",
      });
    }

    const updated = await customerRepository.update(id, data);

    return res.status(200).json({
      status: "success",
      message: "Customer berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Error updateCustomer:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat memperbarui customer",
    });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await customerRepository.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Customer tidak ditemukan",
      });
    }

    await customerRepository.remove(id);

    return res.status(200).json({
      status: "success",
      message: "Customer berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleteCustomer:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menghapus customer",
    });
  }
};
