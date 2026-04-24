import { Router } from "express";
import authRoutes from "./authRoutes.js";
import usersRoutes from "./usersRoutes.js";
import vehiclesRoutes from "./vehiclesRoutes.js";
import parkingSpotsRoutes from "./parkingSpotsRoutes.js";
import reservationsRoutes from "./reservationsRoutes.js";
import paymentsRoutes from "./paymentsRoutes.js";
import hardwareRoutes from "./hardwareRoutes.js";
import reportsRoutes from "./reportsRoutes.js";
import notificationsRoutes from "./notificationsRoutes.js";
import parkingEventsRoutes from "./parkingEventsRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/vehicles", vehiclesRoutes);
router.use("/parking-spots", parkingSpotsRoutes);
router.use("/reservations", reservationsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/hardware", hardwareRoutes);
router.use("/reports", reportsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/parking-events", parkingEventsRoutes);

export default router;
