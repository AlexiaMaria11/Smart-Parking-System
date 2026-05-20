import { Router } from "express";
import { usersController } from "../controllers/usersController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, usersController.list);

export default router;
