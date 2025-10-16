// controllers/transactionItemController.js
import * as transactionItemRepository from "../repositories/transactionItemRepository.js";
import { validationResult } from "express-validator";

export const getAllTransactionItems = async (req, res) => {
  try {
    const items = await transactionItemRepository.findAll();
    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil semua item transaksi",
      data: items,
    });
  } catch (error) {
    console.error("Error getAllTransactionItems:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil item transaksi",
    });
  }
};

export const getTransactionItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await transactionItemRepository.findById(id);

    if (!item) {
      return res.status(404).json({ status: "error", message: "Item transaksi tidak ditemukan" });
    }

    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil detail item transaksi",
      data: item,
    });
  } catch (error) {
    console.error("Error getTransactionItemById:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil detail item transaksi",
    });
  }
};

export const createTransactionItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", errors: errors.array() });
    }

    const data = req.body;
    const item = await transactionItemRepository.create(data);

    return res.status(201).json({
      status: "success",
      message: "Item transaksi berhasil ditambahkan",
      data: item,
    });
  } catch (error) {
    console.error("Error createTransactionItem:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menambahkan item transaksi",
    });
  }
};

export const updateTransactionItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", errors: errors.array() });
    }

    const { id } = req.params;
    const data = req.body;

    const existing = await transactionItemRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ status: "error", message: "Item transaksi tidak ditemukan" });
    }

    const updated = await transactionItemRepository.update(id, data);

    return res.status(200).json({
      status: "success",
      message: "Item transaksi berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Error updateTransactionItem:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat memperbarui item transaksi",
    });
  }
};

export const deleteTransactionItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await transactionItemRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ status: "error", message: "Item transaksi tidak ditemukan" });
    }

    await transactionItemRepository.remove(id);

    return res.status(200).json({
      status: "success",
      message: "Item transaksi berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleteTransactionItem:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menghapus item transaksi",
    });
  }
};