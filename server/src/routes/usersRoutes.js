import { Router } from "express";
import { usersController } from "../controllers/usersController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

router.get("/", authenticate, requireAdmin, usersController.list);
router.patch("/me", authenticate, usersController.updateProfile);
router.patch("/me/password", authenticate, usersController.changePassword);
router.delete("/me", authenticate, usersController.remove);

export default router;
