import { Router } from "express";
import { vehiclesController } from "../controllers/vehiclesController.js";

const router = Router();

router.get("/", vehiclesController.list);

export default router;
