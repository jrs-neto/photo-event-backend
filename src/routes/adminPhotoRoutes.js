import { Router } from "express";
import adminPhotoController from "../controllers/adminPhotoController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

// Aplica o middleware existente `authenticateToken`
router.delete("/:id", authenticateToken, (req, res) => adminPhotoController.deletePhoto(req, res));

export default router;
