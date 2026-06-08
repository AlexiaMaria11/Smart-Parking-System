import { Router } from "express";
import { vehiclesController } from "../controllers/vehiclesController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, vehiclesController.list);
router.post("/", authenticate, vehiclesController.create);
router.put("/:id", authenticate, vehiclesController.update);
router.delete("/:id", authenticate, vehiclesController.remove);
router.patch("/:id/default", authenticate, vehiclesController.setDefault);

export default router;
