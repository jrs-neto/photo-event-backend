import { Router } from "express";
import { adminAuthController } from "../controllers/adminAuthController.js";

const router = Router();

router.post("/login", adminAuthController.login);

export default router;
