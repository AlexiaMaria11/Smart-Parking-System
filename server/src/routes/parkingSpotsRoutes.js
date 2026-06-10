import { Router } from "express";
import { parkingSpotsController } from "../controllers/parkingSpotsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

router.get("/", parkingSpotsController.list);
router.patch("/:id/release", authenticate, requireAdmin, parkingSpotsController.release);
router.patch("/:id/defective", authenticate, requireAdmin, parkingSpotsController.setDefective);

export default router;
