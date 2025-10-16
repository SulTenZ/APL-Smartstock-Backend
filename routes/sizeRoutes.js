// routes/sizeRoutes.js
import express from "express";
import * as sizeController from "../controllers/sizeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validateCreateSize, validateUpdateSize } from "../middlewares/validation/sizeValidation.js";

const router = express.Router();

router.get("/", sizeController.getAllSizes);
router.get("/:id", sizeController.getSizeById);

router.use(authMiddleware.verifyToken);

router.post("/", validateCreateSize, sizeController.createSize);
router.put("/:id", validateUpdateSize, sizeController.updateSize);
router.delete("/:id", sizeController.deleteSize);

export default router;
