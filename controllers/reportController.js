import * as reportRepository from "../repositories/reportRepository.js";
import PDFDocument from "pdfkit";

// Fungsi untuk mendapatkan laporan dalam format JSON
export const getFinancialSummaryReport = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ status: "error", message: "Parameter 'year' dan 'month' diperlukan." });
    }

    const summary = await reportRepository.getFinancialSummary(parseInt(year), parseInt(month));

    return res.status(200).json({
      status: "success",
      message: "Laporan ringkasan keuangan berhasil dibuat.",
      data: summary,
    });
  } catch (error) {
    console.error("Error getFinancialSummaryReport:", error);
    return res.status(500).json({ status: "error", message: "Gagal membuat laporan." });
  }
};

// Fungsi untuk men-download laporan dalam format PDF
export const downloadFinancialSummaryPDF = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ status: "error", message: "Parameter 'year' dan 'month' diperlukan." });
    }

    const summary = await reportRepository.getFinancialSummary(parseInt(year), parseInt(month));
    
    // --- Mulai Membuat PDF ---
    const doc = new PDFDocument({ margin: 50 });

    // Tentukan nama file saat di-download
    const filename = `Laporan-Keuangan-${summary.period.month}-${summary.period.year}.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    // "Salurkan" output PDF langsung ke respons HTTP
    doc.pipe(res);

    // --- Isi Konten PDF ---
    // Header
    doc.fontSize(20).font('Helvetica-Bold').text("Laporan Keuangan Bulanan", { align: "center" });
    doc.fontSize(14).font('Helvetica').text(`Periode: ${summary.period.month} ${summary.period.year}`, { align: "center" });
    doc.moveDown(2);

    // Garis pemisah
    doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(2);
    
    // Fungsi bantu untuk format Rupiah
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    }

    // Isi Laporan
    doc.fontSize(12).font('Helvetica-Bold').text("Ringkasan Pendapatan:", { underline: true });
    doc.moveDown();
    doc.font('Helvetica').text(`Total Pendapatan (Omzet): ${formatCurrency(summary.totalRevenue)}`);
    doc.moveDown(0.5);
    doc.text(`Total Keuntungan (Profit): ${formatCurrency(summary.totalProfit)}`);
    doc.moveDown(2);

    doc.fontSize(12).font('Helvetica-Bold').text("Ringkasan Transaksi:", { underline: true });
    doc.moveDown();
    doc.font('Helvetica').text(`Jumlah Transaksi Berhasil: ${summary.transactionCount} transaksi`);
    doc.moveDown(3);
    
    // Footer
    doc.fontSize(10).text(`Laporan ini dibuat secara otomatis pada ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}.`, {
        align: 'center',
        lineBreak: false,
    });
    
    // Selesaikan pembuatan PDF
    doc.end();

  } catch (error) {
    console.error("Error downloadFinancialSummaryPDF:", error);
    res.status(500).json({ status: "error", message: "Gagal membuat file PDF." });
  }
};