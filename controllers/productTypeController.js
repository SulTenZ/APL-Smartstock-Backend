// controllers/productTypeController.js
import * as productTypeRepository from "../repositories/productTypeRepository.js";
import { validationResult } from "express-validator";

/**
 * Mendapatkan semua tipe produk
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getAllProductTypes = async (req, res) => {
  try {
    const { search, limit, page } = req.query;
    const result = await productTypeRepository.getAllProductTypes({
      search,
      limit,
      page,
    });

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan data tipe produk",
      ...result,
    });
  } catch (error) {
    console.error("Error getting product types:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil data tipe produk",
    });
  }
};

/**
 * Mendapatkan tipe produk berdasarkan ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getProductTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const productType = await productTypeRepository.getProductTypeById(id);

    if (!productType) {
      return res.status(404).json({
        status: "error",
        message: "Tipe produk tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan detail tipe produk",
      data: productType,
    });
  } catch (error) {
    console.error("Error getting product type:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil detail tipe produk",
    });
  }
};

/**
 * Membuat tipe produk baru
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const createProductType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validasi gagal",
        errors: errors.array(),
      });
    }

    const { name } = req.body;

    // Periksa apakah nama sudah ada
    const nameExists = await productTypeRepository.isProductTypeNameExists(
      name
    );
    if (nameExists) {
      return res.status(400).json({
        status: "error",
        message: "Nama tipe produk sudah digunakan",
      });
    }

    const productType = await productTypeRepository.createProductType({ name });

    return res.status(201).json({
      status: "success",
      message: "Berhasil membuat tipe produk baru",
      data: productType,
    });
  } catch (error) {
    console.error("Error creating product type:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat membuat tipe produk baru",
    });
  }
};

/**
 * Memperbarui tipe produk
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const updateProductType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validasi gagal",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { name } = req.body;

    // Periksa apakah tipe produk ada
    const existingProductType = await productTypeRepository.getProductTypeById(
      id
    );
    if (!existingProductType) {
      return res.status(404).json({
        status: "error",
        message: "Tipe produk tidak ditemukan",
      });
    }

    // Periksa apakah nama sudah digunakan oleh tipe produk lain
    const nameExists = await productTypeRepository.isProductTypeNameExists(
      name,
      id
    );
    if (nameExists) {
      return res.status(400).json({
        status: "error",
        message: "Nama tipe produk sudah digunakan",
      });
    }

    const productType = await productTypeRepository.updateProductType(id, {
      name,
    });

    return res.status(200).json({
      status: "success",
      message: "Berhasil memperbarui tipe produk",
      data: productType,
    });
  } catch (error) {
    console.error("Error updating product type:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat memperbarui tipe produk",
    });
  }
};

/**
 * Menghapus tipe produk
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const deleteProductType = async (req, res) => {
  try {
    const { id } = req.params;

    // Periksa apakah tipe produk ada
    const existingProductType = await productTypeRepository.getProductTypeById(
      id
    );
    if (!existingProductType) {
      return res.status(404).json({
        status: "error",
        message: "Tipe produk tidak ditemukan",
      });
    }

    // Periksa apakah tipe produk masih digunakan oleh produk
    if (existingProductType._count.products > 0) {
      return res.status(400).json({
        status: "error",
        message:
          "Tipe produk tidak dapat dihapus karena masih digunakan oleh produk",
      });
    }

    await productTypeRepository.deleteProductType(id);

    return res.status(200).json({
      status: "success",
      message: "Berhasil menghapus tipe produk",
    });
  } catch (error) {
    console.error("Error deleting product type:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menghapus tipe produk",
    });
  }
};
