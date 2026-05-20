import { Router } from "express";
import { reservationsController } from "../controllers/reservationsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, reservationsController.list);

export default router;
