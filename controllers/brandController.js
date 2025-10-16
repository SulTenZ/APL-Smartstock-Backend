// controllers/brandController.js
import * as brandRepository from "../repositories/brandRepository.js";
import { validationResult } from "express-validator";

export const getAllBrands = async (req, res) => {
  try {
    const { search, limit, page } = req.query;
    const result = await brandRepository.getAllBrands({ search, limit, page });

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan data brand",
      ...result,
    });
  } catch (error) {
    console.error("Error getting brands:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil data brand",
    });
  }
};

export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await brandRepository.getBrandById(parseInt(id));

    if (!brand) {
      return res.status(404).json({
        status: "error",
        message: "Brand tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan detail brand",
      data: brand,
    });
  } catch (error) {
    console.error("Error getting brand:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil detail brand",
    });
  }
};

export const createBrand = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", errors: errors.array() });
    }

    const { nama, deskripsi } = req.body;
    const image = req.file?.path;

    const exists = await brandRepository.isBrandNameExists(nama);
    if (exists) {
      return res.status(400).json({ status: "error", message: "Nama brand sudah digunakan" });
    }

    const brand = await brandRepository.createBrand({ nama, deskripsi, image });
    return res.status(201).json({ status: "success", message: "Brand berhasil ditambahkan", data: brand });
  } catch (error) {
    console.error("Error creating brand:", error);
    return res.status(500).json({ status: "error", message: "Terjadi kesalahan saat membuat brand" });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi } = req.body;
    const image = req.file?.path;

    const existing = await brandRepository.getBrandById(parseInt(id));
    if (!existing) {
      return res.status(404).json({ status: "error", message: "Brand tidak ditemukan" });
    }

    const nameExists = await brandRepository.isBrandNameExists(nama, id);
    if (nameExists) {
      return res.status(400).json({ status: "error", message: "Nama brand sudah digunakan" });
    }

    const brand = await brandRepository.updateBrand(id, { nama, deskripsi, image });
    return res.status(200).json({ status: "success", message: "Brand berhasil diperbarui", data: brand });
  } catch (error) {
    console.error("Error updating brand:", error);
    return res.status(500).json({ status: "error", message: "Terjadi kesalahan saat memperbarui brand" });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await brandRepository.getBrandById(parseInt(id));

    if (!existing) {
      return res.status(404).json({ status: "error", message: "Brand tidak ditemukan" });
    }

    if (existing._count.products > 0) {
      return res.status(400).json({
        status: "error",
        message: "Brand tidak bisa dihapus karena masih digunakan oleh produk",
      });
    }

    await brandRepository.deleteBrand(id);
    return res.status(200).json({ status: "success", message: "Brand berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return res.status(500).json({ status: "error", message: "Terjadi kesalahan saat menghapus brand" });
  }
};
