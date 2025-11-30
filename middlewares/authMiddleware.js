// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import { findUserById } from "../repositories/authRepositories.js";

const verifyToken = async (req, res, next) => {
  try {
    let token;

    // 1. Cek Token dari Header (Prioritas Utama - Cara Standar API)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    // 2. Cek Token dari Query Parameter (Alternatif untuk Download File via Browser)
    // Ini hanya akan dipakai jika Header kosong (misal saat buka link PDF di Chrome/Safari)
    else if (req.query && req.query.token) {
      token = req.query.token;
    }

    // Jika token tidak ditemukan di kedua tempat, tolak akses
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized, akses ditolak. Token tidak ditemukan.",
      });
    }

    try {
      // Verifikasi Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({
          message: "Pengguna tidak ditemukan",
        });
      }

      // Simpan data user di request agar bisa dipakai di controller
      req.user = {
        id: user.id,
        email: user.email,
      };

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired, silahkan login kembali",
        });
      }

      return res.status(401).json({
        message: "Token tidak valid",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default {
  verifyToken,
};
