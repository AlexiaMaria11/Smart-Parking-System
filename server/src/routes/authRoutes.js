import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { validateLogin, validateRegister } from "../validators/authValidator.js";

const router = Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);

export default router;
