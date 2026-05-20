import { Router } from "express";
import { vehiclesController } from "../controllers/vehiclesController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, vehiclesController.list);

export default router;
