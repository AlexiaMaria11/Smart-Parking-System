import { Router } from "express";
import { usersController } from "../controllers/usersController.js";

const router = Router();

router.get("/", usersController.list);

export default router;
