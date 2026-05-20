import { Router } from "express";
import { paymentsController } from "../controllers/paymentsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, paymentsController.list);

export default router;
