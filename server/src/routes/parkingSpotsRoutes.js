import { Router } from "express";
import { parkingSpotsController } from "../controllers/parkingSpotsController.js";

const router = Router();

router.get("/", parkingSpotsController.list);

export default router;
