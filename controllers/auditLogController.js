// controllers/auditLogController.js
import * as auditLogRepository from "../repositories/auditLogRepository.js";

export const getAuditLogs = async (req, res) => {
  try {
    const { page, limit, productId } = req.query;

    const result = await auditLogRepository.getLogs({
      page,
      limit,
      productId,
    });

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan riwayat audit log",
      ...result,
    });
  } catch (error) {
    console.error("Error getAuditLogs:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data audit log",
    });
  }
};