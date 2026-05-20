import { Router } from "express";
import { hardwareController } from "../controllers/hardwareController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, hardwareController.list);

export default router;
