// controllers/productSizeController.js
import { validationResult } from "express-validator";
import * as productSizeRepository from "../repositories/productSizeRepository.js";

export const getAllProductSizes = async (req, res) => {
  try {
    const result = await productSizeRepository.getAllProductSizes();
    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil semua data stok ukuran",
      data: result,
    });
  } catch (error) {
    console.error("Error getAllProductSizes:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal mengambil data" });
  }
};

export const getProductSizeById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await productSizeRepository.getProductSizeById(id);
    if (!data)
      return res
        .status(404)
        .json({ status: "error", message: "Data tidak ditemukan" });
    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil detail data",
      data,
    });
  } catch (error) {
    console.error("Error getProductSizeById:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal mengambil detail data" });
  }
};

export const getProductSizeStock = async (req, res) => {
  try {
    const { productId, sizeId } = req.params;
    const data = await productSizeRepository.getProductSizeStock(
      productId,
      sizeId
    );
    if (!data)
      return res
        .status(404)
        .json({
          status: "error",
          message: "Kombinasi produk dan ukuran tidak ditemukan",
        });
    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil data stok",
      data,
    });
  } catch (error) {
    console.error("Error getProductSizeStock:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal mengambil data stok" });
  }
};

// =================================================================
// --- MULAI PERUBAHAN DI SINI ---
// =================================================================

export const createProductSize = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ status: "error", errors: errors.array() });

    const { productId, sizeId, quantity = 0 } = req.body;
    const userId = req.user.id; // <-- Ambil userId dari token

    const exists = await productSizeRepository.isProductSizeExists(
      productId,
      sizeId
    );
    if (exists)
      return res.status(400).json({
        status: "error",
        message: "Kombinasi produk dan ukuran sudah ada",
      });

    const data = await productSizeRepository.createProductSize(
      {
        productId,
        sizeId,
        quantity: parseInt(quantity),
      },
      userId // <-- Lewatkan userId ke repository
    );
    return res.status(201).json({
      status: "success",
      message: "Stok ukuran berhasil ditambahkan",
      data,
    });
  } catch (error) {
    console.error("Error createProductSize:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal menambahkan data" });
  }
};

export const updateProductSize = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ status: "error", errors: errors.array() });

    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id; // <-- Ambil userId dari token

    console.log(`[Controller] Menerima permintaan update untuk ProductSize ID: ${id} oleh User ID: ${userId}`);

    const existing = await productSizeRepository.getProductSizeById(id);
    if (!existing)
      return res
        .status(404)
        .json({ status: "error", message: "Data tidak ditemukan" });

    const data = await productSizeRepository.updateProductSize(
      id,
      {
        quantity: parseInt(quantity),
      },
      userId // <-- Lewatkan userId ke repository
    );
    return res.status(200).json({
      status: "success",
      message: "Stok berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error("Error updateProductSize:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal memperbarui data" });
  }
};

export const deleteProductSize = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // <-- Ambil userId dari token

    const existing = await productSizeRepository.getProductSizeById(id);
    if (!existing)
      return res
        .status(404)
        .json({ status: "error", message: "Data tidak ditemukan" });

    await productSizeRepository.deleteProductSize(
        id, 
        userId // <-- Lewatkan userId ke repository
    );
    return res
      .status(200)
      .json({ status: "success", message: "Data berhasil dihapus" });
  } catch (error) {
    console.error("Error deleteProductSize:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal menghapus data" });
  }
};

// Endpoint baru untuk sinkronisasi ulang stok
export const syncAllProductStocks = async (req, res) => {
  try {
    const result = await productSizeRepository.syncAllProductStocks();
    return res.status(200).json({
      status: "success",
      message: `Berhasil menyinkronkan stok ${result.count} produk`,
      data: result,
    });
  } catch (error) {
    console.error("Error syncAllProductStocks:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal menyinkronkan stok produk" });
  }
};
