// controllers/graphController.js
import { getProfitGraph } from "../repositories/graphRepository.js";

export const getProfitReportGraph = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await getProfitGraph(startDate, endDate);

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    console.error("Error getProfitReportGraph:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data grafik profit",
    });
  }
};
