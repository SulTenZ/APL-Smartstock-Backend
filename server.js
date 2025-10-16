import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import os from "os";

// import routes
import userRoutes from "./routes/authRoutes.js";
import productTypeRoutes from "./routes/productTypeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import sizeRoutes from "./routes/sizeRoutes.js";
import productSizeRoutes from "./routes/productSizeRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import stockBatchRoutes from "./routes/stockBatchRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import transactionItemRoutes from "./routes/transactionItemRoutes.js";
import graphRoutes from "./routes/graphRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

// --- IMPORT BARU YANG DIBUTUHKAN ---
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Daftarkan semua routes
app.use("/api/auth", userRoutes);
app.use("/api/product-types", productTypeRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/size", sizeRoutes);
app.use("/api/product-size", productSizeRoutes);
app.use("/api/product", productRoutes);
app.use("/api/stock-batch", stockBatchRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/transaction-item", transactionItemRoutes);
app.use("/api/graph", graphRoutes);
app.use("/api/audit-log", auditLogRoutes);
app.use("/api/reports", reportRoutes);

// --- PENGGUNAAN ROUTE BARU ---
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("WELCOME TO APL SHOES SMARTSTOCK");
});

app.listen(PORT, "0.0.0.0", () => {
  const networkInterfaces = os.networkInterfaces();
  let networkAddress = null;

  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        networkAddress = net.address;
        break;
      }
    }
    if (networkAddress) break;
  }

  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  if (networkAddress) {
    console.log(`   atau di jaringan Anda: http://${networkAddress}:${PORT}`);
  }
  console.log('✅ Email User:', process.env.EMAIL_USER);
  console.log('✅ Email Password:', process.env.EMAIL_PASSWORD ? 'Loaded' : 'Not loaded');
});

export default app;
