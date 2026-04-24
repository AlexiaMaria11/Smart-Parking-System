import { hardwareService } from "../services/hardwareService.js";
import { ok } from "../utils/response.js";

export const hardwareController = {
  list(req, res) {
    return ok(res, hardwareService.getDevices());
  }
};
