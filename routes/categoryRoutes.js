// routes/categoryRoutes.js
import express from "express";
import * as categoryController from "../controllers/categoryController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateCategory,
  validateUpdateCategory,
} from "../middlewares/validation/categoryValidation.js";

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

router.use(authMiddleware.verifyToken);

router.post("/", validateCreateCategory, categoryController.createCategory);
router.put("/:id", validateUpdateCategory, categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
