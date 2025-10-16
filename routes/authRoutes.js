// routes/authRoutes.js
import express from "express";
import userController from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", userController.registerUser);
router.post("/verify-otp", userController.verifyOTP);
router.post("/resend-otp", userController.resendOTP);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-reset-otp", userController.verifyResetOTP);
router.post("/reset-password", userController.resetPassword);

// Protected routes
router.get(
  "/profile",
  authMiddleware.verifyToken,
  userController.getUserProfile
);

export default router;
