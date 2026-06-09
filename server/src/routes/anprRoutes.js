import { Router } from "express";
import { anprController } from "../controllers/anprController.js";

const router = Router();

router.post("/detect", anprController.detect);

export default router;
