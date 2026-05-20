import { Router } from "express";
import { reportsController } from "../controllers/reportsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, reportsController.overview);

export default router;
