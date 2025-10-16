// middlewares/cronAuthMiddleware.js
import dotenv from "dotenv";

dotenv.config();

const CRON_SECRET = process.env.CRON_SECRET;

const verifyCronSecret = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: "error",
        message: "Authorization header is missing",
      });
    }

    const token = authHeader.split(" ")[1]; // Ambil token dari "Bearer <token>"

    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "Bearer token is missing",
          });
    }

    if (token !== CRON_SECRET) {
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

export default { verifyCronSecret };