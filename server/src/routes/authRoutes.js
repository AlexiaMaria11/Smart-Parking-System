import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { validateLogin } from "../validators/authValidator.js";

const router = Router();

router.post("/login", validateLogin, authController.login);

export default router;
