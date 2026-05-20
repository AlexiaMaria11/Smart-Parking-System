import { Router } from "express";
import { parkingEventsController } from "../controllers/parkingEventsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, parkingEventsController.list);

export default router;
