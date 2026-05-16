import { Router } from "express";
import { anprController } from "../controllers/anprController.js";

const router = Router();

router.post("/detect", anprController.detectEntry);

export default router;
