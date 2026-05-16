import { anprService } from "../services/anprService.js";
import { ok } from "../utils/response.js";

export const anprController = {
  async detectEntry(req, res) {
    const { plate } = req.body;
    if (!plate) return res.status(400).json({ error: "plate required" });

    const result = await anprService.detectEntry(plate.toUpperCase().trim());
    return ok(res, result);
  },
};
