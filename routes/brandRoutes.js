// routes/brandRoutes.js
import express from "express";
import * as brandController from "../controllers/brandController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateBrand,
  validateUpdateBrand,
} from "../middlewares/validation/brandValidation.js";
import { uploadBrand } from "../utils/cloudinary.js";

const router = express.Router();

router.get("/", brandController.getAllBrands);
router.get("/:id", brandController.getBrandById);

router.use(authMiddleware.verifyToken);

router.post("/", uploadBrand.single("image"), validateCreateBrand, brandController.createBrand);
router.put("/:id", uploadBrand.single("image"), validateUpdateBrand, brandController.updateBrand);
router.delete("/:id", brandController.deleteBrand);

export default router;
