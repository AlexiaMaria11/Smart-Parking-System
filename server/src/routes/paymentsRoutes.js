import { Router } from "express";
import { paymentsController } from "../controllers/paymentsController.js";

const router = Router();

router.get("/", paymentsController.list);

export default router;
