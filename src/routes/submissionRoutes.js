import { Router } from "express";
import { uploadMiddleware } from "../middlewares/upload.js";
import { validateSubmission } from "../validations/submission.js";
import { submissionController } from "../controllers/submissionController.js";

const router = Router();

// POST /api/submissions
router.post(
  "/",
  uploadMiddleware.array("photos", 10), // Aceita até 10 fotos no campo "photos"
  validateSubmission,
  submissionController.create,
);

export default router;
