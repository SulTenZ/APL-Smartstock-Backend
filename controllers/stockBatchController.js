// controllers/stockBatchController.js
import * as stockBatchRepository from "../repositories/stockBatchRepository.js";

export const getAllStockBatches = async (req, res) => {
  try {
    const data = await stockBatchRepository.getAllStockBatches();
    return res.status(200).json({ status: "success", message: "Berhasil mengambil semua batch", data });
  } catch (error) {
    console.error("getAllStockBatches error:", error);
    return res.status(500).json({ status: "error", message: "Gagal mengambil data batch" });
  }
};

export const getStockBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await stockBatchRepository.getStockBatchById(id);
    if (!data) return res.status(404).json({ status: "error", message: "Batch tidak ditemukan" });
    return res.status(200).json({ status: "success", message: "Berhasil mengambil detail batch", data });
  } catch (error) {
    console.error("getStockBatchById error:", error);
    return res.status(500).json({ status: "error", message: "Gagal mengambil detail batch" });
  }
};

export const createStockBatch = async (req, res) => {
  try {
    const { nama, totalHarga, jumlahSepatu } = req.body;
    if (!nama || !totalHarga || !jumlahSepatu) {
      return res.status(400).json({ status: "error", message: "Field wajib tidak lengkap" });
    }
    const batch = await stockBatchRepository.createStockBatch({ nama, totalHarga: parseFloat(totalHarga), jumlahSepatu: parseInt(jumlahSepatu) });
    return res.status(201).json({ status: "success", message: "Batch berhasil dibuat", data: batch });
  } catch (error) {
    console.error("createStockBatch error:", error);
    return res.status(500).json({ status: "error", message: "Gagal membuat batch" });
  }
};

export const updateStockBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, totalHarga, jumlahSepatu } = req.body;
    const existing = await stockBatchRepository.getStockBatchById(id);
    if (!existing) return res.status(404).json({ status: "error", message: "Batch tidak ditemukan" });

    const updated = await stockBatchRepository.updateStockBatch(id, {
      nama: nama || existing.nama,
      totalHarga: totalHarga !== undefined ? parseFloat(totalHarga) : existing.totalHarga,
      jumlahSepatu: jumlahSepatu !== undefined ? parseInt(jumlahSepatu) : existing.jumlahSepatu,
    });

    return res.status(200).json({ status: "success", message: "Batch berhasil diperbarui", data: updated });
  } catch (error) {
    console.error("updateStockBatch error:", error);
    return res.status(500).json({ status: "error", message: "Gagal memperbarui batch" });
  }
};

export const deleteStockBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await stockBatchRepository.getStockBatchById(id);
    if (!existing) return res.status(404).json({ status: "error", message: "Batch tidak ditemukan" });
    await stockBatchRepository.deleteStockBatch(id);
    return res.status(200).json({ status: "success", message: "Batch berhasil dihapus" });
  } catch (error) {
    console.error("deleteStockBatch error:", error);
    return res.status(500).json({ status: "error", message: "Gagal menghapus batch" });
  }
};
