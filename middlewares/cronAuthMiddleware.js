// middlewares/cronAuthMiddleware.js
import dotenv from "dotenv";

dotenv.config();

export const verifyCronSecret = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    // 1. Cek apakah ada header Authorization
    if (!authHeader) {
      return res.status(401).json({
        status: "error",
        message: "Authorization header is missing",
      });
    }

    // 2. Cek format "Bearer <token>"
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token format. Use 'Bearer <CRON_SECRET>'",
      });
    }

    const token = authHeader.split(" ")[1];

    // 3. Validasi Token
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Bearer token is missing",
      });
    }

    if (token !== cronSecret) {
      return res.status(403).json({
        status: "error",
        message: "Invalid cron secret",
      });
    }

    next();
  } catch (error) {
    console.error("Cron authentication error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error during cron authentication",
    });
  }
};
