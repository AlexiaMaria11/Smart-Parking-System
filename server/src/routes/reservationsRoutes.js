import { Router } from "express";
import { reservationsController } from "../controllers/reservationsController.js";

const router = Router();

router.get("/", reservationsController.list);

export default router;
