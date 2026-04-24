import { Router } from "express";
import { hardwareController } from "../controllers/hardwareController.js";

const router = Router();

router.get("/", hardwareController.list);

export default router;
