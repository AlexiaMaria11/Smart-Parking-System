import { Router } from "express";
import { notificationsController } from "../controllers/notificationsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, notificationsController.list);

export default router;
