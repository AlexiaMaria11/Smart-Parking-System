import { anprService } from "../services/anprService.js";
import { ok } from "../utils/response.js";

export const anprController = {
  async detect(req, res) {
    const { plate, direction } = req.body;
    if (!plate) return res.status(400).json({ error: "plate required" });

    const io = req.app.get("io");
    const upperPlate = plate.toUpperCase().trim();

    if (direction === "exit") {
      const result = await anprService.detectExit(upperPlate, io);
      return ok(res, result);
    }

    const result = await anprService.detectEntry(upperPlate, io);
    return ok(res, result);
  },
};
