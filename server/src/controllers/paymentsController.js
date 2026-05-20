import { paymentsService } from "../services/paymentsService.js";
import { ok } from "../utils/response.js";

export const paymentsController = {
  async list(req, res, next) {
    try {
      const data = await paymentsService.getPayments({ userId: req.user.id, role: req.user.role });
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  }
};
