// controllers/categoryController.js
import * as categoryRepository from "../repositories/categoryRepositories.js";
import { validationResult } from "express-validator";

export const getAllCategories = async (req, res) => {
  try {
    const { search, limit, page } = req.query;
    const result = await categoryRepository.getAllCategories({
      search,
      limit,
      page,
    });

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan data kategori",
      ...result,
    });
  } catch (error) {
    console.error("Error getting categories:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil data kategori",
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryRepository.getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Kategori tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan detail kategori",
      data: category,
    });
  } catch (error) {
    console.error("Error getting category:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil detail kategori",
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validasi gagal",
        errors: errors.array(),
      });
    }

    const { nama, deskripsi, productTypeId } = req.body;

    const exists = await categoryRepository.isCategoryNameExists(nama);
    if (exists) {
      return res.status(400).json({
        status: "error",
        message: "Nama kategori sudah digunakan",
      });
    }

    const category = await categoryRepository.createCategory({
      nama,
      deskripsi,
      productTypeId,
    });

    return res.status(201).json({
      status: "success",
      message: "Berhasil membuat kategori baru",
      data: category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat membuat kategori baru",
    });
  }
};

export const updateCategory = async (req, res) => {
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
    const { nama, deskripsi, productTypeId } = req.body;

    const existing = await categoryRepository.getCategoryById(id);
    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Kategori tidak ditemukan",
      });
    }

    const nameExists = await categoryRepository.isCategoryNameExists(nama, id);
    if (nameExists) {
      return res.status(400).json({
        status: "error",
        message: "Nama kategori sudah digunakan",
      });
    }

    const category = await categoryRepository.updateCategory(id, {
      nama,
      deskripsi,
      productTypeId,
    });

    return res.status(200).json({
      status: "success",
      message: "Berhasil memperbarui kategori",
      data: category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat memperbarui kategori",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await categoryRepository.getCategoryById(id);
    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Kategori tidak ditemukan",
      });
    }

    if (existing._count.products > 0) {
      return res.status(400).json({
        status: "error",
        message:
          "Kategori tidak dapat dihapus karena masih digunakan oleh produk",
      });
    }

    await categoryRepository.deleteCategory(id);

    return res.status(200).json({
      status: "success",
      message: "Berhasil menghapus kategori",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menghapus kategori",
    });
  }
};
