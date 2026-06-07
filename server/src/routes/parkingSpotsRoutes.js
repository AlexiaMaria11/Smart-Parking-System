import { Router } from "express";
import { parkingSpotsController } from "../controllers/parkingSpotsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", parkingSpotsController.list);
router.patch("/:id/release", authenticate, parkingSpotsController.release);
router.patch("/:id/defective", authenticate, parkingSpotsController.setDefective);

export default router;
