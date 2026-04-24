import { Router } from "express";
import { parkingEventsController } from "../controllers/parkingEventsController.js";

const router = Router();

router.get("/", parkingEventsController.list);

export default router;
