// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import { findUserById } from "../repositories/authRepositories.js";

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized, akses ditolak",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized, akses ditolak",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({
          message: "Pengguna tidak ditemukan",
        });
      }

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