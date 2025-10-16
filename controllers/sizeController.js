// controllers/sizeController.js
import * as sizeRepository from "../repositories/sizeRepository.js";
import { validationResult } from "express-validator";

export const getAllSizes = async (req, res) => {
  try {
    const { search, limit, page, productTypeId } = req.query;
    const result = await sizeRepository.getAllSizes({ search, limit, page, productTypeId });

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan data ukuran",
      ...result,
    });
  } catch (error) {
    console.error("Error getting sizes:", error);
    return res.status(500).json({ status: "error", message: "Terjadi kesalahan saat mengambil data ukuran" });
  }
};

export const getSizeById = async (req, res) => {
  try {
    const { id } = req.params;
    const size = await sizeRepository.getSizeById(id);

    if (!size) {
      return res.status(404).json({ status: "error", message: "Ukuran tidak ditemukan" });
    }

    return res.status(200).json({ status: "success", message: "Berhasil mendapatkan detail ukuran", data: size });
  } catch (error) {
    console.error("Error getting size:", error);
    return res.status(500).json({ status: "error", message: "Terjadi kesalahan saat mengambil detail ukuran" });
  }
};

export const createSize = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", errors: errors.array() });
    }

    const { label, productTypeId } = req.body;

    const exists = await sizeRepository.isSizeLabelExists(label, productTypeId);
    if (exists) {
      return res.status(400).json({ status: "error", message: "Ukuran dengan label ini sudah terdaftar untuk tipe produk ini" });
    }

    const size = await sizeRepository.createSize({ label, productTypeId });
    return res.status(201).json({ status: "success", message: "Ukuran berhasil ditambahkan", data: size });
  } catch (error) {
    console.error("Error creating size:", error);
    return res.status(500).json({ status: "error", message: "Terjadi kesalahan saat membuat ukuran" });
  }
};

export const updateSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, productTypeId } = req.body;

    const existing = await sizeRepository.getSizeById(id);
    if (!existing) {
      return res.status(404).json({ status: "error", message: "Ukuran tidak ditemukan" });
    }

    const nameExists = await sizeRepository.isSizeLabelExists(label, productTypeId, id);
    if (nameExists) {
      return res.status(400).json({ status: "error", message: "Label ukuran sudah digunakan untuk tipe produk ini" });
    }

    const size = await sizeRepository.updateSize(id, { label, productTypeId });
    return res.status(200).json({ status: "success", message: "Ukuran berhasil diperbarui", data: size });
  } catch (error) {
    console.error("Error updating size:", error);
    return res.status(500).json({ status: "error", message: "Terjadi kesalahan saat memperbarui ukuran" });
  }
};

export const deleteSize = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await sizeRepository.getSizeById(id);
    if (!existing) {
      return res.status(404).json({ status: "error", message: "Ukuran tidak ditemukan" });
    }

    await sizeRepository.deleteSize(id);
    return res.status(200).json({ status: "success", message: "Ukuran berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting size:", error);
    return res.status(500).json({ status: "error", message: "Terjadi kesalahan saat menghapus ukuran" });
  }
};
