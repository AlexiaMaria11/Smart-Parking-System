import { Router } from "express";
import { reportsController } from "../controllers/reportsController.js";

const router = Router();

router.get("/", reportsController.overview);

export default router;
