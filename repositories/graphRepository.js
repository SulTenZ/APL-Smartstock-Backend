// repositories/graphRepository.js
// repositories/graphRepository.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Util: format ke YYYY-MM-DD
 */
function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Util: ISO week-numbering year-week, contoh "2025-W35"
 * (Implementasi ringan, cukup akurat untuk agregasi laporan)
 */
function toISOWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Kamis sebagai anchor ISO
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  const isoYear = d.getUTCFullYear();
  return `${isoYear}-W${String(weekNo).padStart(2, "0")}`;
}

/**
 * Util: YYYY-MM
 */
function toMonthKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Util: YYYY
 */
function toYearKey(d) {
  return String(d.getFullYear());
}

/**
 * Hitung profit item termasuk alokasi diskon transaksi secara proporsional.
 * - itemRevenue = hargaJual * qty - item.diskon
 * - transDiscountShare = (itemRevenue / subtotalItemsRevenue) * transaction.diskon
 * - itemProfit = (hargaJual - hargaBeli) * qty - item.diskon - transDiscountShare
 */
function computeItemProfitWithAlloc(item, transaction, subtotalItemsRevenue) {
  const itemRevenue = item.hargaJual * item.quantity - (item.diskon || 0);
  const transDiscount = transaction.diskon || 0;
  const discountShare =
    subtotalItemsRevenue > 0 ? (itemRevenue / subtotalItemsRevenue) * transDiscount : 0;
  const profit =
    (item.hargaJual - item.hargaBeli) * item.quantity - (item.diskon || 0) - discountShare;
  return { itemRevenue, discountShare, profit };
}

export async function getProfitGraph(startDate, endDate) {
  // Build date filter
  const dateFilter = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) {
    dateFilter.lte = new Date(endDate);
    dateFilter.lte.setHours(23, 59, 59, 999);
  }
  const where = {};
  if (startDate || endDate) where.createdAt = dateFilter;

  // Ambil transaksi + item + produk + brand
  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      items: {
        include: {
          product: { include: { brand: true } },
          size: false,
        },
      },
      customer: false,
      processedBy: false,
    },
    orderBy: { createdAt: "asc" },
  });

  // Agregator
  const profitByDay = {};
  const profitByWeek = {};
  const profitByMonth = {};
  const profitByYear = {};

  let totalRevenue = 0;
  let totalCost = 0;
  let totalProfit = 0;

  // Untuk kalkulasi topProducts & brandPerformance
  // Map by productId dan brandName
  const productAgg = new Map(); // productId -> { productName, brandName, quantitySold, revenue, cost, profit }
  const brandAgg = new Map();   // brandName -> { quantitySold, revenue, cost, profit }

  for (const t of transactions) {
    // Subtotal item revenue (untuk alokasi diskon transaksi)
    const subtotalItemsRevenue = t.items.reduce(
      (sum, it) => sum + (it.hargaJual * it.quantity - (it.diskon || 0)),
      0
    );

    // Agregasi transaksi ke hari/minggu/bulan/tahun
    const d = new Date(t.createdAt);
    const dayKey = toDateKey(d);
    const weekKey = toISOWeekKey(d);
    const monthKey = toMonthKey(d);
    const yearKey = toYearKey(d);

    // Hitung revenue/cost/profit per transaksi + sebaran item untuk product/brand
    let transactionRevenue = 0;
    let transactionCost = 0;
    let transactionProfit = 0;

    for (const it of t.items) {
      const { itemRevenue, profit } = computeItemProfitWithAlloc(it, t, subtotalItemsRevenue);
      const cost = it.hargaBeli * it.quantity;

      transactionRevenue += itemRevenue;
      transactionCost += cost;
      transactionProfit += profit;

      // Product aggregation
      const productId = it.productId;
      const productName = it.product?.nama || "Produk Tidak Ditemukan";
      const brandName = it.product?.brand?.nama || "Brand Tidak Ditemukan";

      if (!productAgg.has(productId)) {
        productAgg.set(productId, {
          productId,
          productName,
          brandName,
          quantitySold: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
        });
      }
      const p = productAgg.get(productId);
      p.quantitySold += it.quantity;
      p.revenue += itemRevenue;
      p.cost += cost;
      p.profit += profit;

      // Brand aggregation
      if (!brandAgg.has(brandName)) {
        brandAgg.set(brandName, {
          brand: brandName,
          quantitySold: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
        });
      }
      const b = brandAgg.get(brandName);
      b.quantitySold += it.quantity;
      b.revenue += itemRevenue;
      b.cost += cost;
      b.profit += profit;
    }

    // Summary totals (transaksi-level)
    totalRevenue += transactionRevenue;
    totalCost += transactionCost;
    totalProfit += transactionProfit;

    // Time-bucket totals
    profitByDay[dayKey] = (profitByDay[dayKey] || 0) + transactionProfit;
    profitByWeek[weekKey] = (profitByWeek[weekKey] || 0) + transactionProfit;
    profitByMonth[monthKey] = (profitByMonth[monthKey] || 0) + transactionProfit;
    profitByYear[yearKey] = (profitByYear[yearKey] || 0) + transactionProfit;
  }

  // Top 5 products by profit
  const topProducts = Array.from(productAgg.values())
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  // Brand performance + profitMargin
  const brandPerformance = Array.from(brandAgg.values()).map((row) => ({
    ...row,
    profitMargin: row.revenue > 0 ? (row.profit / row.revenue) * 100 : 0,
  })).sort((a, b) => b.profit - a.profit);

  return {
    summary: {
      totalRevenue,
      totalCost,
      totalProfit,
    },
    profitByDay,
    profitByWeek,
    profitByMonth,
    profitByYear,
    topProducts,
    brandPerformance,
  };
}
