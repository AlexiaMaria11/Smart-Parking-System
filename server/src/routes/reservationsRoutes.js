import { Router } from "express";
import { reservationsController } from "../controllers/reservationsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, reservationsController.list);
router.post("/", authenticate, reservationsController.create);
router.patch("/:id/cancel", authenticate, reservationsController.cancel);
router.patch("/:id/extend", authenticate, reservationsController.extend);

export default router;
