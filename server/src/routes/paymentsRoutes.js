import { Router } from "express";
import { paymentsController } from "../controllers/paymentsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, paymentsController.list);
router.patch("/:id/pay", authenticate, paymentsController.pay);

export default router;
