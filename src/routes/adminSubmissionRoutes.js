import { Router } from "express";
import { adminSubmissionController } from "../controllers/adminSubmissionController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

// Aplica o middleware de autenticação a todas as rotas deste grupo
router.use(authenticateToken);

router.get("/", adminSubmissionController.list);
router.delete("/:id", adminSubmissionController.delete);

export default router;
